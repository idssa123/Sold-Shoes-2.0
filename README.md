# Sold Shoes - Tienda de Calzado de Segunda Mano

Aplicacion web de venta de calzado de segunda mano desarrollada con React, Firebase y Tailwind CSS.

## Caracteristicas

- **Catalogo de productos**: 20 productos de ropa de marca de segunda mano
- **Busqueda**: Busca productos por nombre o descripcion
- **Carrusel destacados**: Visualizacion interactiva de productos destacados
- **Autenticacion**: Sistema de login y registro con Firebase Authentication
- **Carrito de compra**: Anade productos, modifica cantidades y gestiona tu carrito
- **Responsive**: Diseno adaptado para movil, tablet y escritorio
- **Detalles de producto**: Pagina individual con toda la informacion

## Requisitos previos

- Node.js (v14 o superior)
- npm o yarn
- Cuenta de Firebase (gratuita)

## Instalacion

### 1. Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd tienda-futurista
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com)
2. Crea un nuevo proyecto
3. Habilita **Authentication** → Email/Password
4. Habilita **Firestore Database** 
5. En Firestore → Rules, pega temporalmente (modo desarrollo):

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

6. Ve a Project Settings → General → Your apps
7. Registra una aplicación web y copia la configuración

### 4. Configurar variables de entorno

Crea un archivo `.env` en la raíz del proyecto con tu configuración de Firebase:

```env
VITE_FIREBASE_API_KEY=tu_api_key
VITE_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu_proyecto_id
VITE_FIREBASE_STORAGE_BUCKET=tu_proyecto.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
VITE_FIREBASE_APP_ID=tu_app_id
VITE_FIREBASE_MEASUREMENT_ID=tu_measurement_id
```

### 5. Iniciar el servidor de desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

### 6. Cargar productos de ejemplo

1. Abre la aplicación en el navegador
2. En la página de inicio, pulsa el botón **"Cargar productos de ejemplo"**
3. Confirma la acción para cargar los 20 productos en Firestore

## Estructura del proyecto

```
tienda-futurista/
├── src/
│   ├── components/        # Componentes reutilizables
│   │   ├── Carousel.jsx   # Carrusel de productos destacados
│   │   ├── Navbar.jsx     # Barra de navegación
│   │   ├── ProductCard.jsx # Tarjeta de producto
│   │   └── ProtectedRoute.jsx # Rutas protegidas
│   ├── context/           # Context API para estado global
│   │   ├── AuthContext.jsx    # Autenticación
│   │   └── CartContext.jsx    # Carrito de compra
│   ├── lib/               # Utilidades y configuración
│   │   ├── firebase.js    # Configuración de Firebase
│   │   └── seedProducts.js # Script de carga de productos
│   ├── pages/             # Páginas de la aplicación
│   │   ├── Home.jsx       # Página principal
│   │   ├── Products.jsx   # Lista de productos
│   │   ├── ProductDetail.jsx # Detalle de producto
│   │   ├── Cart.jsx       # Carrito de compra
│   │   ├── Login.jsx      # Inicio de sesión
│   │   └── Register.jsx   # Registro de usuario
│   ├── data/              # Datos estáticos
│   │   └── products.js    # 20 productos de ejemplo
│   ├── App.jsx            # Componente principal
│   ├── main.jsx           # Punto de entrada
│   └── index.css          # Estilos globales
├── .env                   # Variables de entorno (crear)
├── .env.example           # Ejemplo de variables
├── package.json           # Dependencias
├── tailwind.config.js     # Configuración de Tailwind
└── vite.config.js         # Configuración de Vite
```

## Tecnologias utilizadas

### Frontend
- **React 18** - Framework de JavaScript
- **React Router** - Enrutamiento
- **Tailwind CSS** - Framework de estilos
- **Vite** - Build tool y dev server

### Backend
- **Firebase Authentication** - Autenticación de usuarios
- **Cloud Firestore** - Base de datos NoSQL
- **Firebase Storage** - Almacenamiento (preparado)

## Funcionalidades principales

### Autenticación
- Registro de usuarios con validación de edad (>18)
- Login con email y contraseña
- Persistencia de sesión
- Logout

### Productos
- Listado de 20 productos de ropa de segunda mano
- Búsqueda en tiempo real
- Filtrado por nombre y descripción
- Carrusel de productos destacados
- Página de detalle de cada producto

### Carrito
- Añadir productos al carrito
- Modificar cantidades
- Eliminar productos
- Cálculo automático del total
- Persistencia en localStorage
- Solo accesible para usuarios autenticados

## Seguridad (Produccion)

Para producción, actualiza las reglas de Firestore:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /products/{productId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Build para produccion

```bash
npm run build
```

Los archivos de producción se generarán en la carpeta `dist/`

## Notas

- Los productos de ejemplo usan imágenes de placeholder (picsum.photos)
- El carrito se guarda en localStorage del navegador
- La aplicación incluye validación de formularios
- Diseño responsive mobile-first
- Accesibilidad con etiquetas ARIA

## Autor

Proyecto de fin de ciclo - 2º DAW

## Licencia

Este proyecto es de código abierto para fines educativos.
