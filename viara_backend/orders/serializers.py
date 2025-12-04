from rest_framework import serializers
from .models import Cart, CartItem, Order, OrderItem, Inquiry
from products.serializers import ProductSerializer

class CartItemSerializer(serializers.ModelSerializer):
    """
    Serializer for CartItem model
    Includes full product details and calculated subtotal
    """
    product = ProductSerializer(read_only=True)
    product_id = serializers.IntegerField(write_only=True)
    subtotal = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    
    class Meta:
        model = CartItem
        fields = ['id', 'product', 'product_id', 'quantity', 'subtotal', 'added_at']


class CartSerializer(serializers.ModelSerializer):
    """
    Serializer for Cart model
    Includes nested cart items and total price
    """
    items = CartItemSerializer(many=True, read_only=True)
    total_price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    
    class Meta:
        model = Cart
        fields = ['id', 'user', 'items', 'total_price', 'created_at']


class OrderItemSerializer(serializers.ModelSerializer):
    """
    Serializer for OrderItem model
    """
    product_name = serializers.CharField(source='product.name', read_only=True)
    
    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_name', 'quantity', 'price', 'subtotal']


class OrderSerializer(serializers.ModelSerializer):
    """
    Serializer for Order model
    Includes nested order items
    """
    items = OrderItemSerializer(many=True, read_only=True)
    payment_method_display = serializers.CharField(
        source='get_payment_method_display', 
        read_only=True
    )
    
    class Meta:
        model = Order
        fields = [
            'id', 'user', 'total_amount', 'status', 
            'payment_method', 'payment_method_display',  # NEW
            'shipping_address', 'phone',  # NEW
            'items', 'created_at', 'updated_at'
        ]
        read_only_fields = ['user', 'total_amount', 'created_at', 'updated_at']


class InquirySerializer(serializers.ModelSerializer):
    """
    Serializer for Inquiry model (Contact form submissions)
    """
    class Meta:
        model = Inquiry
        fields = ['id', 'name', 'email', 'message', 'created_at']
        read_only_fields = ['created_at']