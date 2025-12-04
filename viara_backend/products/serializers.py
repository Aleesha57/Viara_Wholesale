from rest_framework import serializers
from .models import Category, Product

class CategorySerializer(serializers.ModelSerializer):
    """
    Serializer for Category model
    Converts Category objects to/from JSON
    """
    class Meta:
        model = Category
        fields = ['id', 'name', 'created_at']


class ProductSerializer(serializers.ModelSerializer):
    """
    Serializer for Product model
    Includes category name for easier frontend display
    """
    category_name = serializers.CharField(source='category.name', read_only=True)
    
    class Meta:
        model = Product
        fields = [
            'id', 'name', 'description', 'price', 
            'category', 'category_name', 'image', 
            'in_stock', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']