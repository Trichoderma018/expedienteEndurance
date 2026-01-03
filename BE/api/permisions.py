# permissions.py - Sistema básico de permisos para Django

from django.contrib.auth.models import Group
from django.contrib.auth import get_user_model
from rest_framework import serializers, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, BasePermission
from django.contrib.auth import authenticate
from rest_framework.authtoken.models import Token

User = get_user_model()

# =====================================================
# DEFINICIÓN DE ROLES
# =====================================================

ROLES = {
    'ADMIN': 'Admin',
    'STAFF': 'Staff', 
    'USER': 'User'
}

# =====================================================
# CLASES DE PERMISOS
# =====================================================

class IsAdmin(BasePermission):
    """Solo permite acceso a usuarios con rol Admin"""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.groups.filter(name='Admin').exists()

class IsStaff(BasePermission):
    """Permite acceso a usuarios con rol Admin o Staff"""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.groups.filter(name__in=['Admin', 'Staff']).exists()

class IsUser(BasePermission):
    """Permite acceso a cualquier usuario autenticado"""
    def has_permission(self, request, view):
        return request.user.is_authenticated

# =====================================================
# FUNCIONES AUXILIARES
# =====================================================

def get_user_role(user):
    """Obtiene el rol principal del usuario"""
    if not user.is_authenticated:
        return None
    
    if user.is_superuser:
        return ROLES['ADMIN']
    
    if user.groups.filter(name='Admin').exists():
        return ROLES['ADMIN']
    elif user.groups.filter(name='Staff').exists():
        return ROLES['STAFF']
    elif user.groups.filter(name='User').exists():
        return ROLES['USER']
    
    return None

def get_user_permissions(user):
    """Obtiene los permisos del usuario basado en su rol"""
    role = get_user_role(user)
    
    if role == ROLES['ADMIN']:
        return {
            'can_view': True,
            'can_create': True,
            'can_edit': True,
            'can_delete': True,
            'can_manage_users': True
        }
    elif role == ROLES['STAFF']:
        return {
            'can_view': True,
            'can_create': True,
            'can_edit': False,
            'can_delete': False,
            'can_manage_users': False
        }
    elif role == ROLES['USER']:
        return {
            'can_view': True,
            'can_create': False,
            'can_edit': False,
            'can_delete': False,
            'can_manage_users': False
        }
    
    return {
        'can_view': False,
        'can_create': False,
        'can_edit': False,
        'can_delete': False,
        'can_manage_users': False
    }

# =====================================================
# SERIALIZERS
# =====================================================

class UserLoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()

class UserInfoSerializer(serializers.ModelSerializer):
    role = serializers.SerializerMethodField()
    permissions = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 'permissions']
    
    def get_role(self, obj):
        return get_user_role(obj)
    
    def get_permissions(self, obj):
        return get_user_permissions(obj)

# =====================================================
# VISTAS API
# =====================================================

@api_view(['POST'])
def login_view(request):
    """Login de usuario"""
    serializer = UserLoginSerializer(data=request.data)
    
    if serializer.is_valid():
        username = serializer.validated_data['username']
        password = serializer.validated_data['password']
        
        user = authenticate(username=username, password=password)
        
        if user:
            token, created = Token.objects.get_or_create(user=user)
            user_data = UserInfoSerializer(user).data
            
            return Response({
                'token': token.key,
                'user': user_data
            })
        else:
            return Response(
                {'error': 'Credenciales inválidas'}, 
                status=status.HTTP_401_UNAUTHORIZED
            )
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_info(request):
    """Obtiene información del usuario actual"""
    serializer = UserInfoSerializer(request.user)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAdmin])
def register_user(request):
    """Registra un nuevo usuario (solo Admin)"""
    username = request.data.get('username')
    password = request.data.get('password')
    email = request.data.get('email', '')
    role = request.data.get('role', 'User')
    
    if not username or not password:
        return Response(
            {'error': 'Username y password son requeridos'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if User.objects.filter(username=username).exists():
        return Response(
            {'error': 'El usuario ya existe'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Crear usuario
    user = User.objects.create_user(
        username=username,
        password=password,
        email=email
    )
    
    # Asignar rol
    if role in ROLES.values():
        group, created = Group.objects.get_or_create(name=role)
        user.groups.add(group)
    else:
        # Rol por defecto
        group, created = Group.objects.get_or_create(name='User')
        user.groups.add(group)
    
    return Response({
        'message': 'Usuario creado exitosamente',
        'user': UserInfoSerializer(user).data
    }, status=status.HTTP_201_CREATED)