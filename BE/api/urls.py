from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    RegistroView, LoginView, PerfilView, CambiarPasswordView,
    UsuarioViewSet, ExpedienteViewSet, VisitaViewSet, 
    FamiliarViewSet, ProyectoViewSet, ProyectoUsuarioViewSet
)

# ========== ROUTER ==========
# El router crea automáticamente todas las rutas CRUD
router = DefaultRouter()

# Registrar ViewSets (cada uno genera múltiples rutas)
router.register(r'usuarios', UsuarioViewSet, basename='usuario')
router.register(r'expedientes', ExpedienteViewSet, basename='expediente')
router.register(r'visitas', VisitaViewSet, basename='visita')
router.register(r'familiares', FamiliarViewSet, basename='familiar')
router.register(r'proyectos', ProyectoViewSet, basename='proyecto')
router.register(r'proyecto-usuarios', ProyectoUsuarioViewSet, basename='proyecto-usuario')

# ========== URLS ==========
urlpatterns = [
    # Rutas de autenticación (manuales)
    path('auth/registro/', RegistroView.as_view(), name='registro'),
    path('auth/login/', LoginView.as_view(), name='login'),
    path('auth/perfil/', PerfilView.as_view(), name='perfil'),
    path('auth/cambiar-password/', CambiarPasswordView.as_view(), name='cambiar-password'),
    
    # Incluir TODAS las rutas del router
    path('', include(router.urls)),
]