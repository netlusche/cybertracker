<?php
// api/repositories/CategoryRepository.php
require_once __DIR__ . '/Repository.php';

class CategoryRepository extends Repository
{
    public function seedDefaultCategories(int $userId): void
    {
        $defaults = [
            ['name' => 'Private', 'is_default' => 1],
            ['name' => 'Work', 'is_default' => 0],
            ['name' => 'Health', 'is_default' => 0],
            ['name' => 'Finance', 'is_default' => 0],
            ['name' => 'Hobby', 'is_default' => 0]
        ];

        $check = $this->pdo->prepare("SELECT COUNT(*) FROM user_categories WHERE user_id = ?");
        $check->execute([$userId]);

        if ($check->fetchColumn() == 0) {
            $insert = $this->pdo->prepare("INSERT INTO user_categories (user_id, name, is_default) VALUES (?, ?, ?)");
            foreach ($defaults as $cat) {
                try {
                    $insert->execute([$userId, $cat['name'], $cat['is_default']]);
                }
                catch (PDOException $e) {
                // Ignore duplicates
                }
            }
        }
    }

    public function getUserCategories(int $userId): array
    {
        $stmt = $this->pdo->prepare("SELECT id, name, is_default FROM user_categories WHERE user_id = ? ORDER BY is_default DESC, name ASC");
        $stmt->execute([$userId]);
        $categories = $stmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($categories as &$cat) {
            $cat['is_default'] = (bool)$cat['is_default'];
        }

        return $categories;
    }

    public function countUserCategories(int $userId): int
    {
        $check = $this->pdo->prepare("SELECT COUNT(*) FROM user_categories WHERE user_id = ?");
        $check->execute([$userId]);
        return (int)$check->fetchColumn();
    }

    public function createCategory(int $userId, string $name, int $isDefault): array
    {
        $stmt = $this->pdo->prepare("INSERT INTO user_categories (user_id, name, is_default) VALUES (?, ?, ?)");
        $stmt->execute([$userId, $name, $isDefault]);
        $id = (int)$this->pdo->lastInsertId();

        return [
            'id' => $id,
            'name' => $name,
            'is_default' => (bool)$isDefault
        ];
    }

    public function setDefaultCategory(int $userId, int $newDefaultId): void
    {
        $reset = $this->pdo->prepare("UPDATE user_categories SET is_default = 0 WHERE user_id = ?");
        $reset->execute([$userId]);

        $set = $this->pdo->prepare("UPDATE user_categories SET is_default = 1 WHERE id = ? AND user_id = ?");
        $set->execute([$newDefaultId, $userId]);
    }

    public function getCategoryById(int $categoryId, int $userId)
    {
        $stmt = $this->pdo->prepare("SELECT id, name, is_default FROM user_categories WHERE id = ? AND user_id = ?");
        $stmt->execute([$categoryId, $userId]);
        $cat = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($cat) {
            $cat['is_default'] = (bool)$cat['is_default'];
        }

        return $cat;
    }

    public function updateCategoryName(int $categoryId, int $userId, string $oldName, string $newName): void
    {
        $updateCat = $this->pdo->prepare("UPDATE user_categories SET name = ? WHERE id = ? AND user_id = ?");
        $updateCat->execute([$newName, $categoryId, $userId]);

        $updateTasks = $this->pdo->prepare("UPDATE tasks SET category = ? WHERE category = ? AND user_id = ?");
        $updateTasks->execute([$newName, $oldName, $userId]);
    }

    public function deleteCategory(int $categoryId, int $userId): bool
    {
        $stmt = $this->pdo->prepare("DELETE FROM user_categories WHERE id = ? AND user_id = ?");
        $stmt->execute([$categoryId, $userId]);
        return $stmt->rowCount() > 0;
    }

    public function unsetAndPromoteNextDefaultCategory(int $userId, int $deletedCategoryId): bool
    {
        $other = $this->pdo->prepare("SELECT id FROM user_categories WHERE user_id = ? AND id != ? LIMIT 1");
        $other->execute([$userId, $deletedCategoryId]);
        $next = $other->fetch();

        if ($next) {
            $this->pdo->prepare("UPDATE user_categories SET is_default = 1 WHERE id = ?")->execute([$next['id']]);
            return true;
        }
        return false;
    }
}