<?php
require_once 'config/database.php';

// Obtener estadísticas
$totalEmployees = $pdo->query("SELECT COUNT(*) as total FROM employees")->fetch()['total'];
$todayAttendance = $pdo->query("SELECT COUNT(DISTINCT employee_id) as total FROM attendance WHERE DATE(date) = CURDATE()")->fetch()['total'];
$weeklyAttendance = $pdo->query("SELECT COUNT(*) as total FROM attendance WHERE date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)")->fetch()['total'];
$attendanceRate = $totalEmployees > 0 ? round(($todayAttendance / $totalEmployees) * 100) : 0;

// Obtener registros recientes
$recentRecords = $pdo->query("
    SELECT a.*, e.name as employee_name 
    FROM attendance a 
    JOIN employees e ON a.employee_id = e.id 
    ORDER BY a.date DESC, a.check_in_time DESC 
    LIMIT 5
")->fetchAll();
?>

<h1 class="text-2xl font-bold text-gray-800 mb-6">Panel Principal</h1>

<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
    <!-- Tarjetas de estadísticas -->
    <div class="bg-white rounded-lg shadow-md p-6 flex items-center">
        <div class="bg-blue-100 p-3 rounded-full">
            <svg class="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
            </svg>
        </div>
        <div class="ml-4">
            <h2 class="text-sm font-medium text-gray-500">Total Empleados</h2>
            <p class="text-2xl font-semibold text-gray-800"><?php echo $totalEmployees; ?></p>
        </div>
    </div>
    
    <!-- Más tarjetas de estadísticas... -->
</div>

<!-- Tabla de registros recientes -->
<div class="bg-white rounded-lg shadow-md p-6">
    <h2 class="text-lg font-semibold text-gray-800 mb-4">Actividad Reciente</h2>
    
    <?php if (count($recentRecords) > 0): ?>
    <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
            <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Empleado</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hora</th>
            </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
            <?php foreach ($recentRecords as $record): ?>
            <tr>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900"><?php echo htmlspecialchars($record['employee_name']); ?></div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-500"><?php echo date('d/m/Y', strtotime($record['date'])); ?></div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-500"><?php echo date('H:i', strtotime($record['check_in_time'])); ?></div>
                </td>
            </tr>
            <?php endforeach; ?>
        </tbody>
    </table>
    <?php else: ?>
    <p class="text-gray-500 text-center py-4">No hay actividad reciente</p>
    <?php endif; ?>
</div>