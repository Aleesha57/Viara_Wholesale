from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import send_mail
from django.conf import settings
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.authtoken.models import Token


@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    """
    Register a new user with email
    POST /api/auth/register/
    Body: {
        "username": "john",
        "email": "john@example.com",  ← EMAIL REQUIRED
        "password": "pass123",
        "first_name": "John",
        "last_name": "Doe"
    }
    """
    username = request.data.get('username')
    email = request.data.get('email')  # ✨ Email is now required
    password = request.data.get('password')
    first_name = request.data.get('first_name', '')
    last_name = request.data.get('last_name', '')

    # Validation
    if not username or not email or not password:
        return Response(
            {'error': 'Username, email, and password are required'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Validate email format
    if '@' not in email or '.' not in email:
        return Response(
            {'error': 'Please provide a valid email address'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Check if username exists
    if User.objects.filter(username=username).exists():
        return Response(
            {'error': 'Username already exists'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Check if email exists
    if User.objects.filter(email=email).exists():
        return Response(
            {'error': 'Email already registered'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Create user
    try:
        user = User.objects.create_user(
            username=username,
            email=email,  # ✨ Save email
            password=password,
            first_name=first_name,
            last_name=last_name
        )

        # Create token
        token, created = Token.objects.get_or_create(user=user)

        # ✨ Send welcome email (optional)
        try:
            send_mail(
                subject='Welcome to VIARA!',
                message=f'Hi {first_name or username},\n\nWelcome to VIARA Store! Your account has been created successfully.\n\nUsername: {username}\nEmail: {email}\n\nThank you for joining us!',
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[email],
                fail_silently=True,  # Don't fail registration if email fails
            )
        except Exception as e:
            print(f"Failed to send welcome email: {e}")

        return Response({
            'message': 'User registered successfully',
            'token': token.key,
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'is_staff': user.is_staff,
                'is_superuser': user.is_superuser
            }
        }, status=status.HTTP_201_CREATED)

    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    """
    Login user
    POST /api/auth/login/
    Body: {
        "username": "john",
        "password": "pass123"
    }
    """
    username = request.data.get('username')
    password = request.data.get('password')

    if not username or not password:
        return Response(
            {'error': 'Username and password are required'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Authenticate user
    user = authenticate(username=username, password=password)

    if user is None:
        return Response(
            {'error': 'Invalid credentials'},
            status=status.HTTP_401_UNAUTHORIZED
        )

    # Get or create token
    token, created = Token.objects.get_or_create(user=user)

    return Response({
        'message': 'Login successful',
        'token': token.key,
        'user': {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'is_staff': user.is_staff,
            'is_superuser': user.is_superuser
        }
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([AllowAny])
def forgot_password(request):
    """
    Request password reset - sends email with reset link
    POST /api/auth/forgot-password/
    Body: { "email": "user@example.com" }
    
    ✨ NOW SENDS REAL EMAIL!
    """
    email = request.data.get('email')
    
    if not email:
        return Response(
            {'error': 'Email is required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        # Find user by email
        user = User.objects.get(email=email)
        
        # Generate reset token
        token = default_token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        
        # Create reset link for frontend
        frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:5173')
        reset_link = f"{frontend_url}/reset-password/{uid}/{token}/"
        
        # ✨ Send email with reset link
        try:
            email_subject = 'Password Reset Request - VIARA Store'
            email_message = f"""
Hi {user.first_name or user.username},

You requested to reset your password for your VIARA account.

Click the link below to reset your password:
{reset_link}

This link will expire in 24 hours.

If you didn't request this, please ignore this email.

Best regards,
VIARA Store Team
            """
            
            send_mail(
                subject=email_subject,
                message=email_message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[email],
                fail_silently=False,
            )
            
            print(f"✅ Password reset email sent to {email}")
            print(f"🔗 Reset link: {reset_link}")
            
            return Response({
                'message': 'Password reset link has been sent to your email',
                # For development only - remove in production
                'dev_reset_link': reset_link if settings.DEBUG else None
            }, status=status.HTTP_200_OK)
            
        except Exception as email_error:
            print(f"❌ Failed to send email: {email_error}")
            return Response({
                'error': 'Failed to send reset email. Please try again later.',
                'details': str(email_error) if settings.DEBUG else None
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
    except User.DoesNotExist:
        # Don't reveal if email exists (security best practice)
        # But still return success message
        return Response(
            {'message': 'If this email is registered, you will receive a password reset link'},
            status=status.HTTP_200_OK
        )


@api_view(['POST'])
@permission_classes([AllowAny])
def reset_password(request):
    """
    Reset password with token
    POST /api/auth/reset-password/
    Body: {
        "uid": "encoded_user_id",
        "token": "reset_token",
        "new_password": "newpass123"
    }
    """
    uid = request.data.get('uid')
    token = request.data.get('token')
    new_password = request.data.get('new_password')
    
    if not all([uid, token, new_password]):
        return Response(
            {'error': 'UID, token, and new password are required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        # Decode user ID
        user_id = force_str(urlsafe_base64_decode(uid))
        user = User.objects.get(pk=user_id)
        
        # Verify token
        if not default_token_generator.check_token(user, token):
            return Response(
                {'error': 'Invalid or expired reset link'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate password length
        if len(new_password) < 6:
            return Response(
                {'error': 'Password must be at least 6 characters'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Set new password
        user.set_password(new_password)
        user.save()
        
        # ✨ Send confirmation email
        try:
            send_mail(
                subject='Password Changed Successfully - VIARA',
                message=f'Hi {user.first_name or user.username},\n\nYour password has been changed successfully.\n\nIf you did not make this change, please contact us immediately.\n\nBest regards,\nVIARA Store Team',
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                fail_silently=True,
            )
        except:
            pass  # Don't fail password reset if email fails
        
        return Response({
            'message': 'Password reset successful! You can now login with your new password.'
        }, status=status.HTTP_200_OK)
        
    except (TypeError, ValueError, OverflowError, User.DoesNotExist):
        return Response(
            {'error': 'Invalid reset link'},
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['POST'])
@permission_classes([AllowAny])
def change_password(request):
    """
    Change password for logged-in user
    POST /api/auth/change-password/
    Body: {
        "old_password": "oldpass",
        "new_password": "newpass123"
    }
    Requires: Authentication token
    """
    if not request.user.is_authenticated:
        return Response(
            {'error': 'Authentication required'},
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    old_password = request.data.get('old_password')
    new_password = request.data.get('new_password')
    
    if not all([old_password, new_password]):
        return Response(
            {'error': 'Old and new passwords are required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Verify old password
    if not request.user.check_password(old_password):
        return Response(
            {'error': 'Current password is incorrect'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Validate new password
    if len(new_password) < 6:
        return Response(
            {'error': 'Password must be at least 6 characters'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Set new password
    request.user.set_password(new_password)
    request.user.save()
    
    # ✨ Send confirmation email
    try:
        send_mail(
            subject='Password Changed - VIARA',
            message=f'Hi {request.user.first_name or request.user.username},\n\nYour password has been changed successfully.\n\nIf you did not make this change, please contact us immediately.\n\nBest regards,\nVIARA Store Team',
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[request.user.email],
            fail_silently=True,
        )
    except:
        pass
    
    return Response({
        'message': 'Password changed successfully!'
    }, status=status.HTTP_200_OK)