<?php
// api/controllers/CategoryController.php

class CategoryController extends Controller
{
    private function seedDefaultCategories()
    {
        $this->categoryRepo->seedDefaultCategories($this->userId);
    }

    public function index()
    {
        $this->requireAuth();
        $this->seedDefaultCategories();

        $categories = $this->categoryRepo->getUserCategories($this->userId);
        $this->jsonResponse($categories);
    }

    public function store()
    {
        $this->requireAuth();
        $data = $this->getJsonBody();

        if (!isset($data['name']) || empty(trim($data['name']))) {
            $this->errorResponse('Category name required');
        }

        $name = trim($data['name']);

        try {
            $count = $this->categoryRepo->countUserCategories($this->userId);
            $isDefault = ($count === 0) ? 1 : 0;

            $result = $this->categoryRepo->createCategory($this->userId, $name, $isDefault);
            $result['message'] = 'Category added';

            $this->jsonResponse($result);
        }
        catch (PDOException $e) {
            $this->errorResponse('Category likely already exists', 409);
        }
    }

    public function setDefault()
    {
        $this->requireAuth();
        $data = $this->getJsonBody();

        if (!isset($data['id'])) {
            $this->errorResponse('ID required');
        }

        $newDefaultId = $data['id'];

        try {
            $this->categoryRepo->beginTransaction();

            $this->categoryRepo->setDefaultCategory($this->userId, $newDefaultId);

            $this->categoryRepo->commit();
            $this->jsonResponse(['message' => 'Default category updated']);
        }
        catch (PDOException $e) {
            $this->categoryRepo->rollBack();
            $this->errorResponse('Failed to set default', 500);
        }
    }

    public function update()
    {
        $this->requireAuth();
        $data = $this->getJsonBody();

        if (!isset($data['id']) || !isset($data['name']) || empty(trim($data['name']))) {
            $this->errorResponse('ID and new name required');
        }

        $catId = $data['id'];
        $newName = trim($data['name']);

        try {
            $this->categoryRepo->beginTransaction();

            $oldCat = $this->categoryRepo->getCategoryById($catId, $this->userId);

            if (!$oldCat) {
                throw new Exception("Category not found");
            }

            $oldName = $oldCat['name'];

            $this->categoryRepo->updateCategoryName($catId, $this->userId, $oldName, $newName);

            $this->categoryRepo->commit();
            $this->jsonResponse(['message' => 'Category renamed and tasks updated']);

        }
        catch (Exception $e) {
            if ($this->categoryRepo->inTransaction()) {
                $this->categoryRepo->rollBack();
            }
            if ($e->getMessage() === 'Category not found') {
                $this->errorResponse('Category not found', 404);
            }
            else {
                error_log("Category rename error: " . $e->getMessage());
                $this->errorResponse('Database transaction failed', 500);
            }
        }
    }

    public function destroy()
    {
        $this->requireAuth();

        if (!isset($_GET['id'])) {
            $this->errorResponse('ID required');
        }

        $catId = $_GET['id'];

        try {
            $cat = $this->categoryRepo->getCategoryById($catId, $this->userId);

            if ($cat && $cat['is_default']) {
                $promoted = $this->categoryRepo->unsetAndPromoteNextDefaultCategory($this->userId, $catId);

                if (!$promoted) {
                    $this->errorResponse('Cannot delete the only available category');
                }
            }

            $deleted = $this->categoryRepo->deleteCategory($catId, $this->userId);

            if ($deleted) {
                $this->jsonResponse(['message' => 'Category deleted']);
            }
            else {
                $this->errorResponse('Category not found or access denied', 404);
            }
        }
        catch (PDOException $e) {
            $this->errorResponse('Failed to delete category', 500);
        }
    }
}