<?php
session_start();
?>
<?php include 'includes/head.php'; ?>
    <div class="min-h-screen">
        <?php include 'includes/header.php'; ?>
        
        <div class="flex">
            <?php include 'includes/sidebar.php'; ?>
            
            <main class="flex-1 p-6">
                <div class="max-w-7xl mx-auto">
                    <?php
                    $page = isset($_GET['page']) ? $_GET['page'] : 'dashboard';
                    $validPages = ['dashboard', 'employees', 'attendance', 'reports'];
                    
                    if (in_array($page, $validPages)) {
                        include "pages/{$page}.php";
                    } else {
                        include "pages/dashboard.php";
                    }
                    ?>
                </div>
            </main>
        </div>
        
        <?php include 'includes/footer.php'; ?>
    </div>
</body>
</html>