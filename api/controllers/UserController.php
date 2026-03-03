<?php
// api/controllers/UserController.php

class UserController extends Controller
{
    public function getStats()
    {
        $this->requireAuth();

        $user = $this->userRepo->getStats($this->userId);

        if ($user) {
            $points = $user['total_points'];
            $calculatedLevel = floor($points / 100) + 1;

            if ($calculatedLevel > $user['current_level']) {
                $this->userRepo->updateStatsLevel($this->userId, $calculatedLevel);
                $user['current_level'] = $calculatedLevel;
                $user['leveled_up'] = true;
            }
        }

        $this->jsonResponse($user ?: []);
    }

    public function getCalendarToken()
    {
        $this->requireAuth();
        $user = $this->userRepo->findById($this->userId);

        $this->jsonResponse(['token' => $user['calendar_token']]);
    }

    public function generateCalendarToken()
    {
        $this->requireAuth();
        $token = $this->userRepo->generateCalendarToken($this->userId);

        $this->jsonResponse(['token' => $token, 'message' => 'Token generated successfully.']);
    }
}