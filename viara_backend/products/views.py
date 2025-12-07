from rest_framework import viewsets, filters
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from django_filters.rest_framework import DjangoFilterBackend
from .models import Category, Product
from .serializers import CategorySerializer, ProductSerializer

class CategoryViewSet(viewsets.ModelViewSet):
    """
    API endpoint for categories
    
    Endpoints:
    - GET    /api/categories/       - List all categories (Public)
    - POST   /api/categories/       - Create new category (Admin only)
    - GET    /api/categories/{id}/  - Get specific category (Public)
    - PUT    /api/categories/{id}/  - Update category (Admin only)
    - DELETE /api/categories/{id}/  - Delete category (Admin only)
    """
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    
    def get_permissions(self):
        """
        Public can view, only admins can create/update/delete
        """
        if self.action in ['list', 'retrieve']:
            permission_classes = [AllowAny]
        else:
            permission_classes = [IsAuthenticated, IsAdminUser]
        return [permission() for permission in permission_classes]


class ProductViewSet(viewsets.ModelViewSet):
    """
    API endpoint for products
    Supports search, filtering, and ordering
    
    Query parameters:
    - ?search=laptop          - Search by name/description
    - ?category=electronics   - Filter by category name
    - ?ordering=-price        - Sort by price (descending)
    
    Permissions:
    - GET (list/retrieve) - Public
    - POST/PUT/PATCH/DELETE - Admin only
    """
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['price', 'created_at', 'name']
    ordering = ['-created_at']  # Default: newest first
    
    def get_permissions(self):
        """
        Public can view products, only admins can create/update/delete
        """
        if self.action in ['list', 'retrieve']:
            permission_classes = [AllowAny]
        else:
            permission_classes = [IsAuthenticated, IsAdminUser]
        return [permission() for permission in permission_classes]
    
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