import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class VoiceStoryService {
  private synth = window.speechSynthesis;
  private utterance: SpeechSynthesisUtterance | null = null;
  
  isSpeaking = signal(false);

  speak(text: string) {
    this.stop(); // Stop any current speech
    
    if (!text) return;

    this.utterance = new SpeechSynthesisUtterance(text);
    
    // Attempt to find a natural Filipino/Tagalog voice
    const voices = this.synth.getVoices();
    const localVoice = voices.find(v => v.lang.includes('ph') || v.lang.includes('PH') || v.name.includes('Filipino'));
    if (localVoice) {
      this.utterance.voice = localVoice;
    }

    this.utterance.onstart = () => this.isSpeaking.set(true);
    this.utterance.onend = () => this.isSpeaking.set(false);
    this.utterance.onerror = () => this.isSpeaking.set(false);

    this.synth.speak(this.utterance);
  }

  stop() {
    if (this.synth.speaking) {
      this.synth.cancel();
    }
    this.isSpeaking.set(false);
  }
}
