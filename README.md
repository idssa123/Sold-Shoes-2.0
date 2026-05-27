#  SoldShoes — Tienda de ropa y calzado de segunda mano

App React + Firebase para comprar y vender moda de segunda mano.

---

##  Requisitos previos

- Node.js ≥ 18
- Proyecto Firebase con **Authentication**, **Firestore** y **Storage** habilitados

---

##  Instalación

```bash
git clone <repo>
cd soldshoes
npm install
cp .env.example .env
# → rellena el .env con tus claves Firebase
npm run dev
```

---

##  Variables de entorno (`.env`)

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

---

## Estructura de la base de datos (Firestore)

### Colección `users`
```
users/{uid}
  name:      string
  surname:   string
  email:     string
  role:      "user" | "admin"
  provider:  "email" | "google"
  photo:     string (URL, opcional)
  createdAt: Timestamp
  updatedAt: Timestamp
```

Sub-colecciones por usuario:
- `users/{uid}/favorites/{productId}` — productos favoritos
- `users/{uid}/wishlist/{productId}` — lista de deseos (productos sin stock)

---

### Colección `products`
```
products/{productId}
  name:        string
  brand:        string
  price:        number
  stock:        number     ← IMPORTANTE: 0 = sin stock, bloquea la compra
  size:         string
  category:     string
  condition:    string     ("Como nueva" | "Excelente" | "Muy bueno" | ...)
  color:        string
  description:  string
  image:        string (URL)
  featured:     boolean   ← aparece en el carrusel de la Home
  createdAt:    Timestamp
  updatedAt:    Timestamp
```

---

### Colección `orders`
```
orders/{orderId}
  userId:        string (UID del usuario)
  userEmail:     string
  items: [
    { id, name, price, quantity, subtotal }
  ]
  total:          number
  address: {
    name, surname, street, city, zip, phone
  }
  paymentMethod:  "card" | "paypal" | "bizum"
  paymentStatus:  "aceptado" | "rechazado" | "pendiente"
  status:         "pendiente" | "enviado" | "entregado" | "cancelado"
  createdAt:      Timestamp
```

---

## 🌱 Script seed (cargar productos de prueba)

Abre la consola del navegador en la app en desarrollo:

```js
// Cargar productos
import { seedProducts } from "/src/lib/seedProducts.js";
await seedProducts();

// Convertir un usuario en administrador (obtén el UID desde Firebase Auth)
import { seedAdminUser } from "/src/lib/seedProducts.js";
await seedAdminUser("UID_DEL_USUARIO");
```

> **Alternativa**: en Firebase Console → Firestore, edita el documento `users/{uid}` y cambia `role` a `"admin"`.

---

##  Reglas de Firestore recomendadas

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Productos: lectura pública, escritura solo admin
    match /products/{id} {
      allow read: if true;
      allow write: if request.auth != null
        && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "admin";
    }

    // Pedidos: crear si autenticado, leer solo el propio usuario o admin
    match /orders/{id} {
      allow create: if request.auth != null;
      allow read:   if request.auth != null
        && (resource.data.userId == request.auth.uid
            || get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "admin");
      allow update: if request.auth != null
        && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "admin";
    }

    // Usuarios: leer/escribir solo el propio documento
    match /users/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
      allow read: if request.auth != null
        && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "admin";
    }

    // Sub-colecciones de usuario (favoritos, wishlist)
    match /users/{uid}/{sub}/{docId} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
  }
}
```

---

##  Panel de Administración

Accede en `/admin` (solo usuarios con `role: "admin"`).

**Funcionalidades:**
- **Dashboard**: resumen de ingresos, stock bajo, últimos pedidos
- **Productos** (CRUD completo):
  - Crear, editar, eliminar productos
  - Campo `stock` con alerta visual si ≤ 2 unidades
  - Marcar como destacado (aparece en portada)
- **Pedidos**: ver todos los pedidos, cambiar estado (pendiente → enviado → entregado)
- **Usuarios**: ver registros, promover/degradar a administrador

---

##  Funcionalidades principales

| Feature | Estado |
|---------|--------|
| Registro / Login email + Google | ✅ |
| Email de verificación al registrarse | ✅ |
| Guardar usuarios en Firestore | ✅ |
| Catálogo con filtros y paginación | ✅ |
| Detalle de producto | ✅ |
| Carrito (localStorage) | ✅ |
| Checkout multi-paso con pago simulado | ✅ |
| Guardar pedidos en Firestore | ✅ |
| **Decrementar stock al comprar** | ✅ |
| Historial de pedidos del usuario | ✅ |
| Favoritos persistentes en Firestore | ✅ |
| Lista de deseos (productos sin stock) | ✅ |
| **Panel admin con CRUD productos** | ✅ |
| **Gestión de pedidos desde admin** | ✅ |
| **Gestión de usuarios / roles** | ✅ |

---

##  Build para producción

```bash
npm run build
# carpeta dist/ lista para desplegar en Vercel, Netlify, Firebase Hosting...
```
