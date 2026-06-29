// ── MODAL UI ─────────────────────────────────────────────────────────────────

export function showModal(id) {
    document.getElementById(id).classList.add('show');
}

export function closeModal(id) {
    document.getElementById(id).classList.remove('show');
}
