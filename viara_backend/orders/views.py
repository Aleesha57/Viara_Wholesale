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
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Order, OrderItem
from .serializers import OrderSerializer

class OrderViewSet(viewsets.ModelViewSet):
    """
    API endpoint for orders
    
    Endpoints:
    - GET    /api/orders/              - List user's orders
    - POST   /api/orders/              - Create order
    - GET    /api/orders/{id}/         - Get order details
    - PATCH  /api/orders/{id}/         - Update order (admin)
    - DELETE /api/orders/{id}/         - Delete order (admin)
    - POST   /api/orders/{id}/cancel/  - Cancel order (user/admin)
    """
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """
        Return orders for current user
        Admins can see all orders
        """
        user = self.request.user
        if user.is_staff or user.is_superuser:
            return Order.objects.all().order_by('-created_at')
        return Order.objects.filter(user=user).order_by('-created_at')
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """
        Cancel an order
        POST /api/orders/{id}/cancel/
        
        Users can cancel their own orders if status is 'pending' or 'processing'
        Admins can cancel any order except 'delivered'
        """
        order = self.get_object()
        user = request.user
        
        # Check if user owns this order (unless admin)
        if not (user.is_staff or user.is_superuser):
            if order.user != user:
                return Response(
                    {'error': 'You do not have permission to cancel this order'},
                    status=status.HTTP_403_FORBIDDEN
                )
        
        # Check if order can be cancelled
        if order.status == 'cancelled':
            return Response(
                {'error': 'Order is already cancelled'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if order.status == 'delivered':
            return Response(
                {'error': 'Cannot cancel delivered orders'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # For regular users, only allow cancellation of pending/processing orders
        if not (user.is_staff or user.is_superuser):
            if order.status not in ['pending', 'processing']:
                return Response(
                    {'error': f'Cannot cancel orders with status: {order.status}'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        # Cancel the order
        order.status = 'cancelled'
        order.save()
        
        return Response({
            'message': 'Order cancelled successfully',
            'order': OrderSerializer(order).data
        }, status=status.HTTP_200_OK)


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
