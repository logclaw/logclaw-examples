package ai.logclaw.examples.notes;

import java.time.Instant;

public record Note(String id, String title, String content, String created_at) {
    public Note(String id, String title, String content) {
        this(id, title, content, Instant.now().toString());
    }
}
