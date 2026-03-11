package ai.logclaw.examples.notes;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@RestController
public class NotesController {

    private static final Logger log = LoggerFactory.getLogger(NotesController.class);
    private final Map<String, Note> notes = new ConcurrentHashMap<>();
    private final AtomicInteger nextId = new AtomicInteger(1);

    @GetMapping("/")
    public ResponseEntity<String> index() {
        StringBuilder notesHtml = new StringBuilder();
        notes.values().stream()
                .sorted(Comparator.comparing(Note::created_at).reversed())
                .forEach(n -> notesHtml.append(String.format("""
                    <div style="border:1px solid #ddd; padding:12px; margin:8px 0; border-radius:8px;">
                        <strong>%s</strong>
                        <p style="color:#666; margin:4px 0;">%s</p>
                        <small style="color:#999;">%s &mdash; ID: %s</small>
                    </div>""", n.title(), n.content(), n.created_at(), n.id())));

        String html = String.format("""
            <!DOCTYPE html>
            <html>
            <head><title>Spring Boot Notes — LogClaw Example</title></head>
            <body style="max-width:600px; margin:40px auto; font-family:system-ui;">
                <h1>📝 Spring Boot Notes</h1>
                <p style="color:#666;">LogClaw OTel logging example. Logs via Java Agent (zero-code OTel).</p>

                <form id="create-form" style="margin:20px 0;">
                    <input name="title" placeholder="Title" required
                           style="width:100%%; padding:8px; margin:4px 0; box-sizing:border-box;" />
                    <textarea name="content" placeholder="Content" rows="3"
                              style="width:100%%; padding:8px; margin:4px 0; box-sizing:border-box;"></textarea>
                    <button type="submit" style="padding:8px 16px; cursor:pointer;">Create Note</button>
                </form>

                <button onclick="fetch('/api/notes/error', {method:'POST'}).then(()=>alert('Error log sent!'))"
                        style="padding:8px 16px; background:#fee; border:1px solid #fcc; cursor:pointer; margin-bottom:16px;">
                    🔴 Simulate Error Log
                </button>

                <h2>Notes</h2>
                <div>%s</div>

                <script>
                document.getElementById('create-form').addEventListener('submit', async (e) => {
                    e.preventDefault();
                    const form = e.target;
                    await fetch('/api/notes', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ title: form.title.value, content: form.content.value })
                    });
                    window.location.reload();
                });
                </script>
            </body>
            </html>""",
                notesHtml.length() > 0 ? notesHtml.toString() : "<p style=\"color:#999;\">No notes yet.</p>");

        return ResponseEntity.ok().header("Content-Type", "text/html").body(html);
    }

    @GetMapping("/api/notes")
    public Map<String, Object> listNotes() {
        log.info("Listing all notes, count={}", notes.size());
        return Map.of("notes", new ArrayList<>(notes.values()), "count", notes.size());
    }

    @PostMapping("/api/notes")
    public ResponseEntity<Note> createNote(@RequestBody Map<String, String> body) {
        String title = body.get("title");
        if (title == null || title.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "title is required");
        }
        String content = body.getOrDefault("content", "");
        String id = String.valueOf(nextId.getAndIncrement());
        Note note = new Note(id, title, content);
        notes.put(id, note);
        log.info("Note created: {}, id={}", title, id);
        return ResponseEntity.status(HttpStatus.CREATED).body(note);
    }

    @PostMapping("/api/notes/error")
    public Map<String, String> simulateError() {
        log.error("Simulated database connection failure, error_type=ConnectionRefusedError, database=notes-db");
        return Map.of(
                "status", "error_logged",
                "message", "ERROR log sent to LogClaw via OTLP"
        );
    }

    @DeleteMapping("/api/notes/{id}")
    public Map<String, Object> deleteNote(@PathVariable String id) {
        Note deleted = notes.remove(id);
        if (deleted == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Note not found");
        }
        log.info("Note deleted: {}, id={}", deleted.title(), id);
        return Map.of("deleted", deleted);
    }

    @GetMapping("/health")
    public Map<String, String> health() {
        return Map.of("status", "ok", "service", "spring-boot-notes");
    }
}
