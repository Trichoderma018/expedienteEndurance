from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from .models import CustomUser, Expediente, Visita, Familiar, Proyecto, ProyectoUsuario
from .serializers import (
    RegistroUsuarioSerializer, CrearUsuarioAtletaSerializer,
    UsuarioSerializer, UsuarioActualizarSerializer,
    CambiarPasswordSerializer, ExpedienteSerializer, ExpedienteCrearSerializer,
    VisitaSerializer, VisitaCrearSerializer, FamiliarSerializer, 
    ProyectoSerializer, ProyectoCrearSerializer, ProyectoUsuarioSerializer
)


# ============= AUTENTICACIÓN =============

class RegistroView(APIView):
    """Registro público de nuevos usuarios (opcional, solo para staff/admin)"""
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = RegistroUsuarioSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            
            refresh = RefreshToken.for_user(user)
            
            return Response({
                'message': 'Usuario registrado exitosamente',
                'user': UsuarioSerializer(user).data,
                'tokens': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                }
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    """Login de usuarios con JWT"""
    permission_classes = [AllowAny]
    
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        
        if not username or not password:
            return Response({
                'error': 'Se requiere username y password'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        user = authenticate(username=username, password=password)
        
        if user is None:
            return Response({
                'error': 'Credenciales inválidas'
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        if not user.activo:
            return Response({
                'error': 'Usuario inactivo'
            }, status=status.HTTP_403_FORBIDDEN)
        
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'message': 'Login exitoso',
            'user': UsuarioSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        })


class PerfilView(APIView):
    """Ver y actualizar perfil del usuario autenticado"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        serializer = UsuarioSerializer(request.user)
        return Response(serializer.data)
    
    def put(self, request):
        serializer = UsuarioActualizarSerializer(
            request.user, 
            data=request.data, 
            partial=True
        )
        if serializer.is_valid():
            serializer.save()
            return Response({
                'message': 'Perfil actualizado exitosamente',
                'user': UsuarioSerializer(request.user).data
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CambiarPasswordView(APIView):
    """Cambiar contraseña del usuario autenticado"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        serializer = CambiarPasswordSerializer(data=request.data)
        
        if serializer.is_valid():
            user = request.user
            
            if not user.check_password(serializer.validated_data['password_actual']):
                return Response({
                    'error': 'La contraseña actual es incorrecta'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            user.set_password(serializer.validated_data['password_nueva'])
            user.save()
            
            return Response({
                'message': 'Contraseña cambiada exitosamente'
            })
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ============= USUARIOS =============

class UsuarioViewSet(viewsets.ModelViewSet):
    """CRUD de usuarios"""
    queryset = CustomUser.objects.all()
    permission_classes = [AllowAny]  # TODO: Cambiar a [IsAuthenticated, IsStaffOrAdmin]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return RegistroUsuarioSerializer
        elif self.action in ['update', 'partial_update']:
            return UsuarioActualizarSerializer
        return UsuarioSerializer
    
    def get_queryset(self):
        """Filtrar usuarios"""
        queryset = CustomUser.objects.all()
        
        # Filtro por rol
        rol = self.request.query_params.get('rol')
        if rol:
            queryset = queryset.filter(rol=rol)
        
        # Filtro por activo
        activo = self.request.query_params.get('activo')
        if activo is not None:
            queryset = queryset.filter(activo=activo.lower() == 'true')
        
        # Filtro por sede
        sede = self.request.query_params.get('sede')
        if sede:
            queryset = queryset.filter(sede=sede)
        
        return queryset
    
    @action(detail=False, methods=['post'], url_path='crear-atleta')
    def crear_atleta(self, request):
        """
        Endpoint especial para que Admin/Staff creen usuarios atletas 
        SIN necesidad de logout/login
        """
        serializer = CrearUsuarioAtletaSerializer(data=request.data)
        
        if serializer.is_valid():
            user = serializer.save()
            
            return Response({
                'message': 'Usuario atleta creado exitosamente',
                'user': UsuarioSerializer(user).data,
                'password_temporal': f"{user.username}123"
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def desactivar(self, request, pk=None):
        """Desactivar un usuario"""
        usuario = self.get_object()
        usuario.activo = False
        usuario.save()
        return Response({'message': 'Usuario desactivado'})
    
    @action(detail=True, methods=['post'])
    def activar(self, request, pk=None):
        """Activar un usuario"""
        usuario = self.get_object()
        usuario.activo = True
        usuario.save()
        return Response({'message': 'Usuario activado'})
    
    @action(detail=True, methods=['post'])
    def resetear_password(self, request, pk=None):
        """Resetear contraseña de un usuario (solo Admin/Staff)"""
        usuario = self.get_object()
        nueva_password = f"{usuario.username}123"
        usuario.set_password(nueva_password)
        usuario.save()
        
        return Response({
            'message': 'Contraseña reseteada',
            'nueva_password': nueva_password
        })


# ============= EXPEDIENTES =============

class ExpedienteViewSet(viewsets.ModelViewSet):
    """CRUD de expedientes"""
    queryset = Expediente.objects.all()
    permission_classes = [AllowAny]  # TODO: Cambiar a [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    
    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return ExpedienteCrearSerializer
        return ExpedienteSerializer
    
    def get_queryset(self):
        """Filtrar expedientes"""
        queryset = Expediente.objects.select_related('user').prefetch_related('visitas')
        
        # Filtro por usuario
        user_id = self.request.query_params.get('user_id')
        if user_id:
            queryset = queryset.filter(user_id=user_id)
        
        # Filtro por activo
        activo = self.request.query_params.get('activo')
        if activo is not None:
            queryset = queryset.filter(activo=activo.lower() == 'true')
        
        # Filtro por género
        genero = self.request.query_params.get('genero')
        if genero:
            queryset = queryset.filter(genero=genero)
        
        return queryset
    
    @action(detail=True, methods=['get'])
    def resumen(self, request, pk=None):
        """Obtener resumen del expediente con estadísticas"""
        expediente = self.get_object()
        
        return Response({
            'expediente': ExpedienteSerializer(expediente, context={'request': request}).data,
            'estadisticas': {
                'total_visitas': expediente.visitas.count(),
                'ultima_visita': expediente.visitas.first().fecha_visita if expediente.visitas.exists() else None,
            }
        })


# ============= VISITAS =============

class VisitaViewSet(viewsets.ModelViewSet):
    """CRUD de visitas domiciliarias"""
    queryset = Visita.objects.all()
    permission_classes = [AllowAny]  # TODO: Cambiar a [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    
    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return VisitaCrearSerializer
        return VisitaSerializer
    
    def get_queryset(self):
        """Filtrar visitas"""
        queryset = Visita.objects.select_related('expediente__user').prefetch_related('familiares')
        
        # Filtro por expediente
        expediente_id = self.request.query_params.get('expediente_id')
        if expediente_id:
            queryset = queryset.filter(expediente_id=expediente_id)
        
        # Filtro por fecha
        fecha_desde = self.request.query_params.get('fecha_desde')
        fecha_hasta = self.request.query_params.get('fecha_hasta')
        
        if fecha_desde:
            queryset = queryset.filter(fecha_visita__gte=fecha_desde)
        if fecha_hasta:
            queryset = queryset.filter(fecha_visita__lte=fecha_hasta)
        
        return queryset.order_by('-fecha_visita')
    
    @action(detail=True, methods=['post'], url_path='agregar-familiar')
    def agregar_familiar(self, request, pk=None):
        """Agregar un familiar a una visita existente"""
        visita = self.get_object()
        serializer = FamiliarSerializer(data=request.data)
        
        if serializer.is_valid():
            serializer.save(visita=visita)
            return Response({
                'message': 'Familiar agregado',
                'familiar': serializer.data
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ============= FAMILIARES =============

class FamiliarViewSet(viewsets.ModelViewSet):
    """CRUD de familiares"""
    queryset = Familiar.objects.all()
    serializer_class = FamiliarSerializer
    permission_classes = [AllowAny]  # TODO: Cambiar a [IsAuthenticated]
    
    def get_queryset(self):
        """Filtrar familiares por visita"""
        queryset = Familiar.objects.all()
        
        visita_id = self.request.query_params.get('visita_id')
        if visita_id:
            queryset = queryset.filter(visita_id=visita_id)
        
        return queryset


# ============= PROYECTOS =============

class ProyectoViewSet(viewsets.ModelViewSet):
    """CRUD de proyectos"""
    queryset = Proyecto.objects.all()
    permission_classes = [AllowAny]  # TODO: Cambiar a [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return ProyectoCrearSerializer
        return ProyectoSerializer
    
    def get_queryset(self):
        """Filtrar proyectos"""
        queryset = Proyecto.objects.prefetch_related('usuarios')
        
        # Filtro por activo
        activo = self.request.query_params.get('activo')
        if activo is not None:
            queryset = queryset.filter(activo=activo.lower() == 'true')
        
        return queryset
    
    @action(detail=True, methods=['post'], url_path='agregar-usuario')
    def agregar_usuario(self, request, pk=None):
        """Agregar un usuario al proyecto"""
        proyecto = self.get_object()
        usuario_id = request.data.get('usuario_id')
        
        if not usuario_id:
            return Response({
                'error': 'Se requiere usuario_id'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            usuario = CustomUser.objects.get(id=usuario_id)
            relacion, created = ProyectoUsuario.objects.get_or_create(
                proyecto=proyecto,
                usuario=usuario
            )
            
            if created:
                return Response({
                    'message': 'Usuario agregado al proyecto'
                })
            else:
                return Response({
                    'message': 'El usuario ya está en el proyecto'
                })
        except CustomUser.DoesNotExist:
            return Response({
                'error': 'Usuario no encontrado'
            }, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=True, methods=['post'], url_path='remover-usuario')
    def remover_usuario(self, request, pk=None):
        """Remover un usuario del proyecto"""
        proyecto = self.get_object()
        usuario_id = request.data.get('usuario_id')
        
        try:
            relacion = ProyectoUsuario.objects.get(
                proyecto=proyecto,
                usuario_id=usuario_id
            )
            relacion.delete()
            return Response({
                'message': 'Usuario removido del proyecto'
            })
        except ProyectoUsuario.DoesNotExist:
            return Response({
                'error': 'Relación no encontrada'
            }, status=status.HTTP_404_NOT_FOUND)


# ============= PROYECTO USUARIOS =============

class ProyectoUsuarioViewSet(viewsets.ModelViewSet):
    """CRUD de relaciones proyecto-usuario"""
    queryset = ProyectoUsuario.objects.all()
    serializer_class = ProyectoUsuarioSerializer
    permission_classes = [AllowAny]  # TODO: Cambiar a [IsAuthenticated]