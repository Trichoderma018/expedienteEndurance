from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, Expediente, Visita, Familiar, Proyecto, ProyectoUsuario


@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    """Configuración del admin para CustomUser"""
    list_display = ['username', 'email', 'first_name', 'last_name', 'rol', 'sede', 'activo']
    list_filter = ['rol', 'activo', 'sede', 'is_staff', 'is_superuser']
    search_fields = ['username', 'email', 'first_name', 'last_name']
    
    fieldsets = UserAdmin.fieldsets + (
        ('Información Adicional', {
            'fields': ('rol', 'sede', 'telefono', 'cargo', 'departamento', 'activo')
        }),
    )
    
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Información Adicional', {
            'fields': ('rol', 'sede', 'telefono', 'cargo', 'departamento', 'activo')
        }),
    )


@admin.register(Expediente)
class ExpedienteAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'genero', 'activo', 'fecha_creacion']
    list_filter = ['activo', 'genero', 'fecha_creacion']
    search_fields = ['user__username', 'user__email']
    date_hierarchy = 'fecha_creacion'
    
    fieldsets = (
        ('Usuario', {
            'fields': ('user',)
        }),
        ('Información Básica', {
            'fields': ('imagen', 'genero', 'activo')
        }),
        ('Comentarios', {
            'fields': ('comentario_general', 'comentario_academico', 'comentario_economico'),
            'classes': ('collapse',)
        }),
    )


class FamiliarInline(admin.TabularInline):
    model = Familiar
    extra = 1


@admin.register(Visita)
class VisitaAdmin(admin.ModelAdmin):
    list_display = ['id', 'get_usuario', 'institucion', 'fecha_visita', 'fecha_registro']
    list_filter = ['fecha_visita', 'institucion', 'tipo_vivienda', 'trabaja']
    search_fields = ['expediente__user__username', 'cedula', 'institucion']
    date_hierarchy = 'fecha_visita'
    inlines = [FamiliarInline]
    
    fieldsets = (
        ('Expediente', {
            'fields': ('expediente',)
        }),
        ('Información Académica', {
            'fields': ('institucion', 'ano_academico', 'adecuacion', 'tipo_adecuacion',
                      'tiene_beca', 'monto_beca', 'institucion_beca')
        }),
        ('Datos Personales', {
            'fields': ('fecha_nacimiento', 'cedula', 'telefono_principal', 
                      'telefono_secundario', 'direccion')
        }),
        ('Salud', {
            'fields': ('lesiones', 'enfermedades', 'tratamientos', 
                      'atencion_medica', 'consumo_drogas'),
            'classes': ('collapse',)
        }),
        ('Vivienda', {
            'fields': ('tipo_vivienda', 'monto_vivienda', 'especificaciones_vivienda'),
            'classes': ('collapse',)
        }),
        ('Empleo', {
            'fields': ('trabaja', 'empresa', 'salario'),
            'classes': ('collapse',)
        }),
        ('Economía', {
            'fields': ('ingresos_totales', 'gastos_totales', 'gasto_alimentacion',
                      'gasto_servicios', 'gasto_transporte', 'gasto_salud', 'deudas'),
            'classes': ('collapse',)
        }),
        ('Otros', {
            'fields': ('observaciones', 'adjuntos', 'fecha_visita'),
        }),
    )
    
    def get_usuario(self, obj):
        return obj.expediente.user.get_full_name() or obj.expediente.user.username
    get_usuario.short_description = 'Usuario'


@admin.register(Familiar)
class FamiliarAdmin(admin.ModelAdmin):
    list_display = ['nombre_completo', 'parentesco', 'edad', 'ocupacion', 'get_visita']
    list_filter = ['parentesco']
    search_fields = ['nombre_completo', 'visita__expediente__user__username']
    
    def get_visita(self, obj):
        return f"Visita #{obj.visita.id}"
    get_visita.short_description = 'Visita'


class ProyectoUsuarioInline(admin.TabularInline):
    model = ProyectoUsuario
    extra = 1


@admin.register(Proyecto)
class ProyectoAdmin(admin.ModelAdmin):
    list_display = ['nombre', 'fecha_inicio', 'fecha_fin', 'activo', 'get_participantes']
    list_filter = ['activo', 'fecha_inicio']
    search_fields = ['nombre', 'descripcion']
    date_hierarchy = 'fecha_inicio'
    inlines = [ProyectoUsuarioInline]
    
    def get_participantes(self, obj):
        return obj.usuarios.count()
    get_participantes.short_description = 'Participantes'


@admin.register(ProyectoUsuario)
class ProyectoUsuarioAdmin(admin.ModelAdmin):
    list_display = ['proyecto', 'usuario', 'fecha_inscripcion', 'activo']
    list_filter = ['activo', 'fecha_inscripcion']
    search_fields = ['proyecto__nombre', 'usuario__username']