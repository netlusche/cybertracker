<?php
// api/Router.php

class Router
{
    private array $routes = [];

    public function get(string $path, array |callable $handler): void
    {
        $this->addRoute('GET', $path, $handler);
    }

    public function post(string $path, array |callable $handler): void
    {
        $this->addRoute('POST', $path, $handler);
    }

    public function put(string $path, array |callable $handler): void
    {
        $this->addRoute('PUT', $path, $handler);
    }

    public function delete(string $path, array |callable $handler): void
    {
        $this->addRoute('DELETE', $path, $handler);
    }

    private function addRoute(string $method, string $path, array |callable $handler): void
    {
        // Normalize path
        $path = trim($path, '/');
        $this->routes[] = [
            'method' => $method,
            'path' => $path,
            'handler' => $handler
        ];
    }

    public function dispatch(string $method, string $requestRoute): void
    {
        $requestRoute = trim($requestRoute, '/');
        error_log("DISPATCHING: Method=$method, Route=$requestRoute");
        foreach ($this->routes as $r) {
            if ($r['path'] == 'tasks/download') {
                error_log("FOUND tasks/download: Method=" . $r['method']);
            }
        }

        foreach ($this->routes as $route) {
            if ($route['method'] === $method && $route['path'] === $requestRoute) {
                $handler = $route['handler'];

                if (is_array($handler) && count($handler) === 2) {
                    $class = $handler[0];
                    $methodName = $handler[1];
                    $controller = new $class();
                    $controller->$methodName();
                    return;
                }
                else if (is_callable($handler)) {
                    call_user_func($handler);
                    return;
                }
            }
        }

        http_response_code(404);
        echo json_encode(['error' => 'Route not found: ' . ($requestRoute ?: '/')]);
        exit;
    }
}