from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny

from .models import Cart, CartItem, Order, OrderItem, Inquiry
from .serializers import (
    CartSerializer, CartItemSerializer,
    OrderSerializer, InquirySerializer
)
from products.models import Product


# ------------------------------------------------------------
# CART VIEWSET
# ------------------------------------------------------------
class CartViewSet(viewsets.ModelViewSet):
    """
    API endpoint for shopping cart
    """
    serializer_class = CartSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Cart.objects.filter(user=self.request.user)

    @action(detail=False, methods=['get'])
    def current(self, request):
        """Get or create current user's cart"""
        cart, created = Cart.objects.get_or_create(user=request.user)
        serializer = self.get_serializer(cart)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def add_item(self, request):
        """
        Add item to cart
        Body: {"product_id": 1, "quantity": 2}
        """
        cart, created = Cart.objects.get_or_create(user=request.user)
        product_id = request.data.get('product_id')
        quantity = request.data.get('quantity', 1)

        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return Response(
                {"error": "Product not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        cart_item, created = CartItem.objects.get_or_create(
            cart=cart,
            product=product,
            defaults={'quantity': quantity}
        )

        if not created:
            cart_item.quantity += quantity
            cart_item.save()

        return Response({
            "message": "Item added to cart",
            "cart": CartSerializer(cart).data
        })

    @action(detail=False, methods=['post'])
    def remove_item(self, request):
        """
        Remove item from cart
        Body: {"item_id": 1}
        """
        item_id = request.data.get('item_id')

        try:
            cart_item = CartItem.objects.get(id=item_id, cart__user=request.user)
            cart_item.delete()
            return Response({"message": "Item removed from cart"})
        except CartItem.DoesNotExist:
            return Response(
                {"error": "Item not found"},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=False, methods=['post'])
    def clear(self, request):
        """Clear all items from cart"""
        cart = Cart.objects.get(user=request.user)
        cart.items.all().delete()
        return Response({"message": "Cart cleared"})


# ------------------------------------------------------------
# ORDER VIEWSET (MERGED VERSION - FIXED)
# ------------------------------------------------------------
class OrderViewSet(viewsets.ModelViewSet):
    """
    API endpoint for orders
    """
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        Admin → see all orders
        User  → only their orders
        """
        user = self.request.user

        if user.is_staff or user.is_superuser:
            return Order.objects.all()

        return Order.objects.filter(user=user)

    @action(detail=False, methods=['post'])
    def create_from_cart(self, request):
        """
        Create order from current user's cart
        """
        try:
            cart = Cart.objects.get(user=request.user)
        except Cart.DoesNotExist:
            return Response(
                {"error": "Cart is empty"},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not cart.items.exists():
            return Response(
                {"error": "Cart is empty"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Extra details from frontend
        payment_method = request.data.get('payment_method', 'cod')
        shipping_address = request.data.get('shipping_address', '')
        phone = request.data.get('phone', '')

        # Create Order
        order = Order.objects.create(
            user=request.user,
            total_amount=cart.total_price,
            status='pending',
            shipping_address=shipping_address,
            phone=phone,
            payment_method=payment_method,
        )

        # Convert cart → order items
        for item in cart.items.all():
            OrderItem.objects.create(
                order=order,
                product=item.product,
                quantity=item.quantity,
                price=item.product.price,
            )

        # Clear cart
        cart.items.all().delete()

        return Response({
            "message": "Order created successfully",
            "order": OrderSerializer(order).data
        }, status=status.HTTP_201_CREATED)


# ------------------------------------------------------------
# INQUIRY VIEWSET
# ------------------------------------------------------------
class InquiryViewSet(viewsets.ModelViewSet):
    """
    API endpoint for contact form inquiries
    """
    queryset = Inquiry.objects.all()
    serializer_class = InquirySerializer
    permission_classes = [AllowAny]
    http_method_names = ['get', 'post']
