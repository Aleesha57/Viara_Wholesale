from rest_framework import viewsets, filters
from rest_framework.permissions import AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from .models import Category, Product
from .serializers import CategorySerializer, ProductSerializer

class CategoryViewSet(viewsets.ModelViewSet):
    """
    API endpoint for categories
    
    Endpoints:
    - GET    /api/categories/       - List all categories
    - POST   /api/categories/       - Create new category
    - GET    /api/categories/{id}/  - Get specific category
    - PUT    /api/categories/{id}/  - Update category
    - DELETE /api/categories/{id}/  - Delete category
    """
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]


class ProductViewSet(viewsets.ModelViewSet):
    """
    API endpoint for products
    Supports search, filtering, and ordering
    
    Query parameters:
    - ?search=laptop          - Search by name/description
    - ?category=electronics   - Filter by category name
    - ?ordering=-price        - Sort by price (descending)
    """
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [AllowAny]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['price', 'created_at', 'name']
    ordering = ['-created_at']  # Default: newest first
    
    def get_queryset(self):
        """
        Custom filtering by category name
        Example: /api/products/?category=electronics
        """
        queryset = Product.objects.all()
        category = self.request.query_params.get('category', None)
        
        if category:
            queryset = queryset.filter(category__name__iexact=category)
        
        return queryset
