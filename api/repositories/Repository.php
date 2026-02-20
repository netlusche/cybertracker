<?php
// api/repositories/Repository.php

abstract class Repository
{
    protected PDO $pdo;

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
    }

    public function beginTransaction(): void
    {
        $this->pdo->beginTransaction();
    }

    public function commit(): void
    {
        $this->pdo->commit();
    }

    public function rollBack(): void
    {
        $this->pdo->rollBack();
    }

    public function inTransaction(): bool
    {
        return $this->pdo->inTransaction();
    }
}