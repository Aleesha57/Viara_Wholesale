from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import send_mail, EmailMultiAlternatives
from django.conf import settings
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.authtoken.models import Token


@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    """Register a new user with email"""
    username = request.data.get('username')
    email = request.data.get('email')
    password = request.data.get('password')
    first_name = request.data.get('first_name', '')
    last_name = request.data.get('last_name', '')

    # Validation
    if not username or not email or not password:
        return Response(
            {'error': 'Username, email, and password are required'},
            status=status.HTTP_400_BAD_REQUEST
        )

    if '@' not in email or '.' not in email:
        return Response(
            {'error': 'Please provide a valid email address'},
            status=status.HTTP_400_BAD_REQUEST
        )

    if User.objects.filter(username=username).exists():
        return Response(
            {'error': 'Username already exists'},
            status=status.HTTP_400_BAD_REQUEST
        )

    if User.objects.filter(email=email).exists():
        return Response(
            {'error': 'Email already registered'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Create user
    try:
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name
        )

        token, created = Token.objects.get_or_create(user=user)

        # Send welcome email
        try:
            send_mail(
                subject='Welcome to VIARA!',
                message=f'Hi {first_name or username},\n\nWelcome to VIARA Store! Your account has been created successfully.\n\nUsername: {username}\nEmail: {email}\n\nThank you for joining us!',
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[email],
                fail_silently=True,
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
    """Login user"""
    username = request.data.get('username')
    password = request.data.get('password')

    if not username or not password:
        return Response(
            {'error': 'Username and password are required'},
            status=status.HTTP_400_BAD_REQUEST
        )

    user = authenticate(username=username, password=password)

    if user is None:
        return Response(
            {'error': 'Invalid credentials'},
            status=status.HTTP_401_UNAUTHORIZED
        )

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
    ✨ MOBILE-FRIENDLY VERSION
    Request password reset - sends HTML email with clickable button
    """
    email = request.data.get('email')
    
    if not email:
        return Response(
            {'error': 'Email is required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        user = User.objects.get(email=email)
        
        # Generate reset token
        token = default_token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        
        # Create reset link
        frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:5173')
        reset_link = f"{frontend_url}/reset-password/{uid}/{token}/"
        
        # ✨ HTML EMAIL - Works on mobile!
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
            <style>
                body {{
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                }}
                .container {{
                    background: #f9f9f9;
                    border-radius: 10px;
                    padding: 30px;
                    margin: 20px 0;
                }}
                .header {{
                    text-align: center;
                    padding-bottom: 20px;
                }}
                .logo {{
                    font-size: 32px;
                    font-weight: bold;
                    color: #667eea;
                    letter-spacing: 2px;
                }}
                .button {{
                    display: inline-block;
                    padding: 15px 40px;
                    margin: 20px 0;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white !important;
                    text-decoration: none;
                    border-radius: 8px;
                    font-weight: bold;
                    text-align: center;
                    font-size: 16px;
                }}
                .footer {{
                    text-align: center;
                    color: #666;
                    font-size: 12px;
                    margin-top: 30px;
                    padding-top: 20px;
                    border-top: 1px solid #ddd;
                }}
                /* Mobile responsive */
                @media only screen and (max-width: 600px) {{
                    body {{
                        padding: 10px;
                    }}
                    .container {{
                        padding: 20px;
                    }}
                    .button {{
                        display: block;
                        width: 100%;
                        box-sizing: border-box;
                    }}
                }}
            </style>
        </head>
        <body>
            <div class="header">
                <div class="logo">VIARA</div>
            </div>
            <div class="container">
                <h2>Password Reset Request</h2>
                <p>Hi {user.first_name or user.username},</p>
                <p>You requested to reset your password for your VIARA account.</p>
                <p>Click the button below to reset your password:</p>
                <center>
                    <a href="{reset_link}" class="button">Reset Password</a>
                </center>
                <p style="color: #666; font-size: 14px;">
                    Or copy and paste this link in your browser:<br>
                    <a href="{reset_link}" style="color: #667eea; word-break: break-all;">{reset_link}</a>
                </p>
                <p style="color: #e74c3c; font-size: 14px;">
                    ⚠️ This link will expire in 24 hours.
                </p>
                <p style="color: #666; font-size: 14px;">
                    If you didn't request this, please ignore this email.
                </p>
            </div>
            <div class="footer">
                <p>Best regards,<br>VIARA Store Team</p>
            </div>
        </body>
        </html>
        """
        
        # Plain text version (fallback)
        text_content = f"""
Hi {user.first_name or user.username},

You requested to reset your password for your VIARA account.

Click the link below to reset your password:
{reset_link}

This link will expire in 24 hours.

If you didn't request this, please ignore this email.

Best regards,
VIARA Store Team
        """
        
        # Send email with both HTML and text versions
        try:
            msg = EmailMultiAlternatives(
                subject='Password Reset Request - VIARA Store',
                body=text_content,
                from_email=settings.DEFAULT_FROM_EMAIL,
                to=[email]
            )
            msg.attach_alternative(html_content, "text/html")
            msg.send(fail_silently=False)
            
            print(f"✅ Password reset email sent to {email}")
            print(f"🔗 Reset link: {reset_link}")
            
            return Response({
                'message': 'Password reset link has been sent to your email',
                'dev_reset_link': reset_link if settings.DEBUG else None
            }, status=status.HTTP_200_OK)
            
        except Exception as email_error:
            print(f"❌ Failed to send email: {email_error}")
            return Response({
                'error': 'Failed to send reset email. Please try again later.',
                'details': str(email_error) if settings.DEBUG else None
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
    except User.DoesNotExist:
        return Response(
            {'message': 'If this email is registered, you will receive a password reset link'},
            status=status.HTTP_200_OK
        )


@api_view(['POST'])
@permission_classes([AllowAny])
def reset_password(request):
    """Reset password with token"""
    uid = request.data.get('uid')
    token = request.data.get('token')
    new_password = request.data.get('new_password')
    
    if not all([uid, token, new_password]):
        return Response(
            {'error': 'UID, token, and new password are required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        user_id = force_str(urlsafe_base64_decode(uid))
        user = User.objects.get(pk=user_id)
        
        if not default_token_generator.check_token(user, token):
            return Response(
                {'error': 'Invalid or expired reset link'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if len(new_password) < 6:
            return Response(
                {'error': 'Password must be at least 6 characters'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user.set_password(new_password)
        user.save()
        
        # Send confirmation email
        try:
            send_mail(
                subject='Password Changed Successfully - VIARA',
                message=f'Hi {user.first_name or user.username},\n\nYour password has been changed successfully.\n\nIf you did not make this change, please contact us immediately.\n\nBest regards,\nVIARA Store Team',
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                fail_silently=True,
            )
        except:
            pass
        
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
    """Change password for logged-in user"""
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
    
    if not request.user.check_password(old_password):
        return Response(
            {'error': 'Current password is incorrect'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if len(new_password) < 6:
        return Response(
            {'error': 'Password must be at least 6 characters'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    request.user.set_password(new_password)
    request.user.save()
    
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