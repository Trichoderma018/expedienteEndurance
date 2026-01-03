from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import CustomUser, Expediente, Visita, Familiar, Proyecto, ProyectoUsuario


# ============= USUARIOS =============

class RegistroUsuarioSerializer(serializers.ModelSerializer):
    """Serializer para registro público de usuarios"""
    password = serializers.CharField(
        write_only=True, 
        required=True, 
        validators=[validate_password],
        style={'input_type': 'password'}
    )
    password_confirm = serializers.CharField(
        write_only=True, 
        required=True,
        style={'input_type': 'password'}
    )
    
    class Meta:
        model = CustomUser
        fields = ['username', 'email', 'password', 'password_confirm', 
                  'first_name', 'last_name', 'sede', 'rol']
        extra_kwargs = {
            'email': {'required': True},
            'first_name': {'required': True},
            'last_name': {'required': True},
        }
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({
                "password": "Las contraseñas no coinciden."
            })
        return attrs
    
    def validate_email(self, value):
        if CustomUser.objects.filter(email=value).exists():
            raise serializers.ValidationError("Este correo ya está registrado.")
        return value.lower()
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        
        user = CustomUser.objects.create(**validated_data)
        user.set_password(password)
        user.save()
        
        return user


class CrearUsuarioAtletaSerializer(serializers.ModelSerializer):
    """
    Serializer para que Admin/Staff creen usuarios atletas SIN login/logout.
    Este es el que usarás desde dentro de la app.
    """
    password = serializers.CharField(
        write_only=True,
        required=False,
        help_text="Contraseña por defecto si no se especifica: username123"
    )
    crear_expediente = serializers.BooleanField(
        write_only=True,
        default=True,
        help_text="Crear expediente automáticamente"
    )
    
    # Campos para el expediente
    genero = serializers.ChoiceField(
        choices=[('M', 'Masculino'), ('F', 'Femenino'), ('O', 'Otro')],
        write_only=True,
        required=False
    )
    imagen_perfil = serializers.ImageField(
        write_only=True,
        required=False
    )
    
    class Meta:
        model = CustomUser
        fields = ['username', 'email', 'first_name', 'last_name', 'password',
                  'sede', 'telefono', 'crear_expediente', 'genero', 'imagen_perfil']
        extra_kwargs = {
            'email': {'required': True},
            'first_name': {'required': True},
            'last_name': {'required': True},
        }
    
    def validate_email(self, value):
        if CustomUser.objects.filter(email=value).exists():
            raise serializers.ValidationError("Este correo ya está registrado.")
        return value.lower()
    
    def validate_username(self, value):
        if CustomUser.objects.filter(username=value).exists():
            raise serializers.ValidationError("Este nombre de usuario ya existe.")
        return value
    
    def create(self, validated_data):
        # Extraer datos del expediente
        crear_expediente = validated_data.pop('crear_expediente', True)
        genero = validated_data.pop('genero', None)
        imagen_perfil = validated_data.pop('imagen_perfil', None)
        
        # Contraseña por defecto
        password = validated_data.pop('password', None)
        if not password:
            password = f"{validated_data['username']}123"
        
        # Crear usuario con rol 'user' por defecto
        user = CustomUser.objects.create(
            rol='user',
            activo=True,
            **validated_data
        )
        user.set_password(password)
        user.save()
        
        # Crear expediente si se solicita
        if crear_expediente and genero:
            Expediente.objects.create(
                user=user,
                genero=genero,
                imagen=imagen_perfil,
                activo=True
            )
        
        return user


class UsuarioSerializer(serializers.ModelSerializer):
    """Serializer para mostrar información de usuarios"""
    nombre_completo = serializers.SerializerMethodField()
    tiene_expediente = serializers.SerializerMethodField()
    
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 
                  'nombre_completo', 'sede', 'rol', 'telefono', 'cargo', 
                  'departamento', 'activo', 'date_joined', 'tiene_expediente']
        read_only_fields = ['id', 'date_joined']
    
    def get_nombre_completo(self, obj):
        return obj.get_full_name() or obj.username
    
    def get_tiene_expediente(self, obj):
        return hasattr(obj, 'expediente')


class UsuarioActualizarSerializer(serializers.ModelSerializer):
    """Serializer para actualizar usuarios (sin contraseña)"""
    class Meta:
        model = CustomUser
        fields = ['email', 'first_name', 'last_name', 'sede', 'telefono', 
                  'cargo', 'departamento', 'activo']


class CambiarPasswordSerializer(serializers.Serializer):
    """Serializer para cambiar contraseña"""
    password_actual = serializers.CharField(required=True, style={'input_type': 'password'})
    password_nueva = serializers.CharField(
        required=True, 
        validators=[validate_password],
        style={'input_type': 'password'}
    )
    password_confirmar = serializers.CharField(required=True, style={'input_type': 'password'})
    
    def validate(self, attrs):
        if attrs['password_nueva'] != attrs['password_confirmar']:
            raise serializers.ValidationError({
                "password_nueva": "Las contraseñas no coinciden."
            })
        return attrs


# ============= FAMILIARES =============

class FamiliarSerializer(serializers.ModelSerializer):
    """Serializer para familiares"""
    class Meta:
        model = Familiar
        fields = '__all__'


# ============= VISITAS =============

class VisitaSerializer(serializers.ModelSerializer):
    """Serializer para mostrar visitas"""
    familiares = FamiliarSerializer(many=True, read_only=True)
    edad = serializers.ReadOnlyField()
    nombre_usuario = serializers.CharField(
        source='expediente.user.get_full_name', 
        read_only=True
    )
    adjunto_notas_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Visita
        fields = '__all__'
        read_only_fields = ['fecha_registro', 'edad']
    
    def get_adjunto_notas_url(self, obj):
        if obj.adjunto_notas:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.adjunto_notas.url)
        return None


class VisitaCrearSerializer(serializers.ModelSerializer):
    """Serializer para crear visitas con familiares"""
    familiares = FamiliarSerializer(many=True, required=False)
    
    class Meta:
        model = Visita
        fields = '__all__'
        read_only_fields = ['fecha_registro']
    
    def create(self, validated_data):
        familiares_data = validated_data.pop('familiares', [])
        visita = Visita.objects.create(**validated_data)
        
        # Crear familiares
        for familiar_data in familiares_data:
            Familiar.objects.create(visita=visita, **familiar_data)
        
        return visita
    
    def update(self, instance, validated_data):
        familiares_data = validated_data.pop('familiares', None)
        
        # Actualizar visita
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Actualizar familiares si se proporcionan
        if familiares_data is not None:
            # Eliminar familiares existentes
            instance.familiares.all().delete()
            # Crear nuevos
            for familiar_data in familiares_data:
                Familiar.objects.create(visita=instance, **familiar_data)
        
        return instance


# ============= EXPEDIENTES =============

class ExpedienteSerializer(serializers.ModelSerializer):
    """Serializer para expedientes"""
    usuario = UsuarioSerializer(source='user', read_only=True)
    visitas = VisitaSerializer(many=True, read_only=True)
    total_visitas = serializers.SerializerMethodField()
    imagen_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Expediente
        fields = '__all__'
        read_only_fields = ['fecha_creacion', 'fecha_actualizacion']
    
    def get_total_visitas(self, obj):
        return obj.visitas.count()
    
    def get_imagen_url(self, obj):
        if obj.imagen:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.imagen.url)
        return None


class ExpedienteCrearSerializer(serializers.ModelSerializer):
    """Serializer simplificado para crear expedientes"""
    class Meta:
        model = Expediente
        fields = ['user', 'imagen', 'genero', 'comentario_general',
                  'comentario_academico', 'comentario_economico', 'activo']


# ============= PROYECTOS =============

class ProyectoUsuarioSerializer(serializers.ModelSerializer):
    """Serializer para la relación proyecto-usuario"""
    usuario_info = UsuarioSerializer(source='usuario', read_only=True)
    proyecto_nombre = serializers.CharField(source='proyecto.nombre', read_only=True)
    
    class Meta:
        model = ProyectoUsuario
        fields = '__all__'
        read_only_fields = ['fecha_inscripcion']


class ProyectoSerializer(serializers.ModelSerializer):
    """Serializer para proyectos"""
    participantes = ProyectoUsuarioSerializer(
        source='proyectousuario_set', 
        many=True, 
        read_only=True
    )
    total_participantes = serializers.ReadOnlyField()
    imagen_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Proyecto
        fields = '__all__'
    
    def get_imagen_url(self, obj):
        if obj.imagen:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.imagen.url)
        return None


class ProyectoCrearSerializer(serializers.ModelSerializer):
    """Serializer para crear proyectos"""
    usuarios_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False
    )
    
    class Meta:
        model = Proyecto
        fields = ['nombre', 'descripcion', 'objetivo', 'imagen', 
                  'fecha_inicio', 'fecha_fin', 'activo', 'usuarios_ids']
    
    def create(self, validated_data):
        usuarios_ids = validated_data.pop('usuarios_ids', [])
        proyecto = Proyecto.objects.create(**validated_data)
        
        for user_id in usuarios_ids:
            try:
                usuario = CustomUser.objects.get(id=user_id)
                ProyectoUsuario.objects.create(proyecto=proyecto, usuario=usuario)
            except CustomUser.DoesNotExist:
                pass
        
        return proyecto