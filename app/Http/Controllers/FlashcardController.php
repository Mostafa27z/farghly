<?php

namespace App\Http\Controllers;

use App\Models\FlashcardSet;
use App\Models\Transcript;
use App\Services\GeminiStudyService;
use Illuminate\Http\Request;

class FlashcardController extends Controller
{
    /**
     * Generate AI Flashcards for the transcript, strictly capped by the workspace plan limit.
     */
    public function store(Request $request, Transcript $transcript, GeminiStudyService $studyService)
    {
        $tenant = $request->user()->currentTenant;

        if ($transcript->tenant_id !== $tenant->id) {
            abort(403);
        }

        $maxCardsAllowed = $tenant->maxFlashcardsPerVideo();

        $request->validate([
            'count' => ['required', 'integer', 'min:3', "max:{$maxCardsAllowed}"],
            'prompt' => ['nullable', 'string', 'max:1000'],
        ], [
            'count.max' => "عفواً، الحد الأقصى لعدد البطاقات المسموح بتوليدها لكل فيديو لباقة ({$tenant->plan_name}) هو {$maxCardsAllowed} بطاقة.",
            'count.min' => 'يرجى اختيار 3 بطاقات على الأقل.',
        ]);

        $count = (int) $request->input('count');
        $customPrompt = $request->input('prompt');

        $result = $studyService->generateFlashcards($transcript, $count, $customPrompt);

        if (!$result['success']) {
            return back()->withErrors([
                'flashcards' => $result['message_ar'] ?? 'فشل في توليد البطاقات التعليمية عبر الذكاء الاصطناعي.',
            ]);
        }

        // Save or update flashcard set for this transcript
        $cards = $result['cards'] ?? [];

        $transcript->flashcardSets()->delete(); // Keep current latest set clean

        $transcript->flashcardSets()->create([
            'tenant_id' => $tenant->id,
            'user_id' => $request->user()->id,
            'cards' => $cards,
            'cards_count' => count($cards),
            'custom_prompt' => $customPrompt,
        ]);

        return back()->with('success', "تم إنشاء " . count($cards) . " بطاقة تعليمية ذكية بنجاح!");
    }

    /**
     * Delete the flashcard set for this transcript.
     */
    public function destroy(Request $request, FlashcardSet $flashcardSet)
    {
        if ($flashcardSet->tenant_id !== $request->user()->current_tenant_id) {
            abort(403);
        }

        $flashcardSet->delete();

        return back()->with('success', 'تم حذف مجموعة البطاقات التعليمية.');
    }
}
