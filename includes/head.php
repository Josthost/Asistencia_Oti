<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo isset($pageTitle) ? $pageTitle . ' - ' : ''; ?>Control de Asistencia</title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
    <link href="assets/css/custom.css" rel="stylesheet">
    <style>
        /* Forzar aplicación de estilos personalizados */
        .bg-blue-600 { 
            background-color: var(--primary-600) !important; 
        }
        .bg-blue-700 { 
            background-color: var(--primary-700) !important; 
        }
        .text-blue-600 { 
            color: var(--primary-600) !important; 
        }
        .text-blue-700 { 
            color: var(--primary-700) !important; 
        }
        .hover\:bg-blue-700:hover { 
            background-color: var(--primary-700) !important; 
        }
        .bg-blue-50 { 
            background-color: var(--primary-50) !important; 
        }
        .hover\:bg-blue-50:hover { 
            background-color: var(--primary-50) !important; 
        }
    </style>
</head>
<body class="bg-gray-100">