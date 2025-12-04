from rest_framework import serializers
from django.contrib.auth.models import User
from .models import CustomerProfile

class CustomerProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for CustomerProfile model
    """
    class Meta:
        model = CustomerProfile
        fields = ['phone', 'address']


class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for User model
    Includes nested profile data
    """
    profile = CustomerProfileSerializer(read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'profile']
        read_only_fields = ['id']


class RegisterSerializer(serializers.ModelSerializer):
    """
    Serializer for user registration
    Validates passwords and creates user with profile
    """
    password = serializers.CharField(write_only=True, min_length=8)
    password2 = serializers.CharField(write_only=True, min_length=8)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password2', 'first_name', 'last_name']
    
    def validate(self, data):
        """Check if passwords match"""
        if data['password'] != data['password2']:
            raise serializers.ValidationError({"password": "Passwords don't match"})
        return data
    
    def create(self, validated_data):
        """Create user with encrypted password"""
        validated_data.pop('password2')
        user = User.objects.create_user(**validated_data)
        
        # Create profile automatically
        CustomerProfile.objects.create(user=user)
        
        return user