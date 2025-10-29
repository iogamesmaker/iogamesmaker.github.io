const scales = {
    'majeur': [0, 2, 4, 5, 7, 9, 11], // hele hele halve, hele hele hele halve
    'mineur': [0, 2, 3, 5, 7, 8, 10], // hele halve hele hele halve hele
    'harmonisch_mineur': [0, 2, 3, 5, 7, 8, 11], // verhoogdde 7e
    'melodisch_mineur': [0, 2, 3, 5, 7, 9, 11], // chat gpt lol
    'blues': [0, 3, 5, 6, 7, 10] // HELL YEAH
};

const chromaticScale = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

const enharmonicMap = {
    "C#": "Db", "D#": "Eb", "F#": "Gb", "G#": "Ab", "A#": "Bb"
};

const grondtoonSelect = document.getElementById('grondtoon');
const typeSelect = document.getElementById('toonladder_type');
const resultaatParagraaf = document.getElementById('resultaat_noten');
const pianoKeys = document.querySelectorAll('.piano .key');

function calculateScale() {
    const rootNote = grondtoonSelect.value;
    const scaleType = typeSelect.value;

    const intervals = scales[scaleType];
    if (!intervals) return; // Geen geldige toonladder

    const rootIndex = chromaticScale.indexOf(rootNote.split(' ')[0]); // Gebruik alleen de C/C#/D...

    const scaleNotes = [];

    intervals.forEach(interval => {
        const noteIndex = (rootIndex + interval) % 12;
        let note = chromaticScale[noteIndex];

        if (enharmonicMap[note]) {
             note = `${note} / ${enharmonicMap[note]}`;
        }
        scaleNotes.push(note.split(' ')[0]);
    });

    resultaatParagraaf.textContent = `Noten in de toonladder: ${scaleNotes.join(', ')}`;

    updatePiano(scaleNotes);
}

function updatePiano(notesToHighlight) {
    pianoKeys.forEach(key => {
        key.classList.remove('highlighted');
    });

    notesToHighlight.forEach(note => {
        const keys = document.querySelectorAll(`.piano .key[data-note="${note}"]`);
        keys.forEach(key => {
            key.classList.add('highlighted');
        });
    });
}

grondtoonSelect.addEventListener('change', calculateScale);
typeSelect.addEventListener('change', calculateScale);

calculateScale();
