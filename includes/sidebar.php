<nav class="sidebar-custom w-64 shadow-md hidden md:block">
    <div class="px-4 py-6">
        <ul class="space-y-2">
            <li>
                <a href="?page=dashboard" class="flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-50 transition-all <?php echo $page === 'dashboard' ? 'sidebar-active' : ''; ?>">
                    <svg class="w-5 h-5 mr-3 <?php echo $page === 'dashboard' ? 'text-yellow-primary' : ''; ?>" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7"/>
                    </svg>
                    Panel Principal
                </a>
            </li>
            <li>
                <a href="?page=employees" class="flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-50 transition-all <?php echo $page === 'employees' ? 'sidebar-active' : ''; ?>">
                    <svg class="w-5 h-5 mr-3 <?php echo $page === 'employees' ? 'text-yellow-primary' : ''; ?>" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
                    </svg>
                    Empleados
                </a>
            </li>
            <li>
                <a href="?page=attendance" class="flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-50 transition-all <?php echo $page === 'attendance' ? 'sidebar-active' : ''; ?>">
                    <svg class="w-5 h-5 mr-3 <?php echo $page === 'attendance' ? 'text-yellow-primary' : ''; ?>" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    Asistencia
                </a>
            </li>
            <li>
                <a href="?page=reports" class="flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-50 transition-all <?php echo $page === 'reports' ? 'sidebar-active' : ''; ?>">
                    <svg class="w-5 h-5 mr-3 <?php echo $page === 'reports' ? 'text-yellow-primary' : ''; ?>" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                    </svg>
                    Reportes
                </a>
            </li>
        </ul>
    </div>
</nav>