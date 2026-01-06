from django.db import models


class ChatMessage(models.Model):
    """
    Model to store chat conversation history between user and AI assistant.
    """

    class RoleChoices(models.TextChoices):
        USER = 'user', 'User'
        ASSISTANT = 'assistant', 'Assistant'
        SYSTEM = 'system', 'System'

    role = models.CharField(
        max_length=20,
        choices=RoleChoices.choices,
        help_text="The role of the message sender (user, assistant, or system)"
    )
    content = models.TextField(
        help_text="The actual message content"
    )
    model_name = models.CharField(
        max_length=100,
        help_text="The AI model used for this conversation (e.g., 'openai/gpt-4')"
    )
    timestamp = models.DateTimeField(
        auto_now_add=True,
        help_text="When this message was created"
    )

    # Optional: Add a session_id to group messages into conversations
    session_id = models.CharField(
        max_length=100,
        null=True,
        blank=True,
        db_index=True,
        help_text="Optional session identifier to group related messages"
    )

    class Meta:
        ordering = ['timestamp']
        verbose_name = 'Chat Message'
        verbose_name_plural = 'Chat Messages'

    def __str__(self):
        return f"[{self.role}] {self.content[:50]}..."
