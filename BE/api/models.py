from django.db import models
from django.contrib.auth.models import AbstractUser
from datetime import date


class CustomUser(AbstractUser):
    """Usuario personalizado con información adicional"""
    ROLES = (
        ('admin', 'Administrador'),
        ('staff', 'Personal'),
        ('user', 'Usuario/Atleta'),
    )
    
    sede = models.CharField(max_length=150, blank=True, null=True)
    rol = models.CharField(max_length=20, choices=ROLES, default='user')
    telefono = models.CharField(max_length=30, blank=True, null=True)
    activo = models.BooleanField(default=True)
    
    # Si es staff/admin
    cargo = models.CharField(max_length=30, blank=True, null=True)
    departamento = models.CharField(max_length=30, blank=True, null=True)
    
    def __str__(self):
        return f"{self.username} - {self.get_rol_display()}"
    
    class Meta:
        verbose_name = "Usuario"
        verbose_name_plural = "Usuarios"


class Expediente(models.Model):
    """Expediente de un usuario/atleta"""
    user = models.OneToOneField(
        CustomUser, 
        on_delete=models.CASCADE, 
        related_name='expediente'
    )
    imagen = models.ImageField(
        upload_to='imagenes_perfil/',
        blank=True,
        null=True,
        help_text="Foto del atleta"
    )
    genero = models.CharField(
        max_length=10, 
        choices=[('M', 'Masculino'), ('F', 'Femenino'), ('O', 'Otro')]
    )
    comentario_general = models.TextField(blank=True, null=True)
    comentario_academico = models.TextField(blank=True, null=True)
    comentario_economico = models.TextField(blank=True, null=True)
    activo = models.BooleanField(default=True)
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Expediente de {self.user.get_full_name() or self.user.username}"
    
    class Meta:
        verbose_name = "Expediente"
        verbose_name_plural = "Expedientes"


class Visita(models.Model):
    """Registro de visitas domiciliarias a atletas"""
    expediente = models.ForeignKey(
        Expediente, 
        on_delete=models.CASCADE, 
        related_name='visitas'
    )
    
    # ========== INFORMACIÓN ACADÉMICA ==========
    institucion = models.CharField(max_length=150)
    ano_academico = models.CharField(max_length=4)
    adecuacion = models.CharField(max_length=40, blank=True, null=True)
    tipo_adecuacion = models.CharField(max_length=80, blank=True, null=True)
    tiene_beca = models.BooleanField(default=False)
    monto_beca = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    institucion_beca = models.CharField(max_length=80, blank=True, null=True)
    adjunto_notas = models.FileField(
        upload_to='adjuntos_notas/',
        blank=True,
        null=True,
        help_text="Subir notas (PDF o imagen)"
    )
    
    # ========== DATOS PERSONALES ==========
    fecha_nacimiento = models.DateField()
    cedula = models.CharField(max_length=20)
    telefono_principal = models.CharField(max_length=30)
    telefono_secundario = models.CharField(max_length=30, blank=True, null=True)
    direccion = models.TextField(verbose_name="Lugar de residencia")
    
    # ========== DATOS TÉCNICOS (ATLETA) ==========
    lesiones = models.TextField(
        blank=True, 
        null=True,
        help_text="Historial de lesiones del atleta"
    )
    enfermedades = models.TextField(
        blank=True, 
        null=True,
        help_text="Enfermedades o condiciones médicas"
    )
    tratamientos = models.TextField(
        blank=True, 
        null=True,
        help_text="Tratamientos médicos actuales"
    )
    atencion_medica = models.TextField(
        blank=True, 
        null=True,
        help_text="Centro de atención médica y doctor"
    )
    drogas = models.CharField(
        max_length=200, 
        blank=True, 
        null=True,
        help_text="Consumo de sustancias"
    )
    disponibilidad = models.TextField(
        blank=True, 
        null=True,
        help_text="Disponibilidad para entrenamientos y competencias"
    )
    
    # ========== VIVIENDA ==========
    TIPO_VIVIENDA = (
        ('propia', 'Propia'),
        ('alquilada', 'Alquilada'),
        ('prestada', 'Prestada'),
        ('otro', 'Otro'),
    )
    tipo_vivienda = models.CharField(max_length=20, choices=TIPO_VIVIENDA)
    monto_vivienda = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        default=0,
        help_text="Monto de alquiler o hipoteca"
    )
    especificaciones_vivienda = models.TextField(blank=True, null=True)
    
    # ========== EMPLEO (DEL ATLETA) ==========
    trabaja = models.BooleanField(default=False)
    empresa = models.CharField(max_length=100, blank=True, null=True)
    salario = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    comentario_empleo = models.TextField(blank=True, null=True)
    
    # ========== ECONOMÍA FAMILIAR ==========
    ingresos_totales = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    gastos_totales = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    gasto_alimentacion = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    gasto_agua = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    gasto_luz = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    gasto_internet_cable = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    gasto_celular = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    gasto_transporte = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    gasto_salud = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    deudas = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    # Observaciones generales
    observaciones = models.TextField(blank=True, null=True)
    
    fecha_visita = models.DateField()
    fecha_registro = models.DateTimeField(auto_now_add=True)
    
    @property
    def edad(self):
        """Calcula la edad actual basada en la fecha de nacimiento"""
        today = date.today()
        edad = today.year - self.fecha_nacimiento.year
        
        # Ajustar si aún no ha cumplido años este año
        if (today.month, today.day) < (self.fecha_nacimiento.month, self.fecha_nacimiento.day):
            edad -= 1
        
        return edad
    
    def __str__(self):
        return f"Visita {self.expediente.user.username} - {self.fecha_visita}"
    
    class Meta:
        verbose_name = "Visita"
        verbose_name_plural = "Visitas"
        ordering = ['-fecha_visita']


class Familiar(models.Model):
    """Familiares del atleta (pueden ser múltiples por visita)"""
    visita = models.ForeignKey(
        Visita, 
        on_delete=models.CASCADE, 
        related_name='familiares'
    )
    nombre_completo = models.CharField(max_length=200)
    edad = models.IntegerField()
    parentesco = models.CharField(
        max_length=100,
        help_text="Ej: Padre, Madre, Hermano, Tío, etc."
    )
    ocupacion = models.CharField(max_length=400, blank=True, null=True)
    ingreso_mensual = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    lugar_trabajo = models.CharField(max_length=400, blank=True, null=True)
    
    def __str__(self):
        return f"{self.nombre_completo} ({self.parentesco})"
    
    class Meta:
        verbose_name = "Familiar"
        verbose_name_plural = "Familiares"


class Proyecto(models.Model):
    """Proyectos deportivos/sociales"""
    nombre = models.CharField(max_length=150)
    descripcion = models.TextField()
    objetivo = models.TextField()
    imagen = models.ImageField(
        upload_to='imagenes_proyectos/',
        blank=True,
        null=True,
        help_text="Imagen del proyecto"
    )
    fecha_inicio = models.DateField()
    fecha_fin = models.DateField()
    activo = models.BooleanField(default=True)
    usuarios = models.ManyToManyField(
        CustomUser, 
        through='ProyectoUsuario',
        related_name='proyectos_participando'
    )
    
    def __str__(self):
        return self.nombre
    
    @property
    def total_participantes(self):
        return self.usuarios.filter(proyectousuario__activo=True).count()
    
    class Meta:
        verbose_name = "Proyecto"
        verbose_name_plural = "Proyectos"
        ordering = ['-fecha_inicio']


class ProyectoUsuario(models.Model):
    """Relación entre proyectos y usuarios/atletas"""
    proyecto = models.ForeignKey(Proyecto, on_delete=models.CASCADE)
    usuario = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    fecha_inscripcion = models.DateTimeField(auto_now_add=True)
    activo = models.BooleanField(default=True)
    
    class Meta:
        verbose_name = "Usuario en Proyecto"
        verbose_name_plural = "Usuarios en Proyectos"
        unique_together = ['proyecto', 'usuario']
    
    def __str__(self):
        return f"{self.usuario.username} en {self.proyecto.nombre}"