const { createApp } = Vue;

createApp({
    data() {
        return {
            newMessage: '',
            messages: [],
            isLoading: false,
            editingMessage: null,
            editText: ''
        };
    },
    async created() {
        await this.loadMessages();
    },
    methods: {
        async loadMessages() {
            this.isLoading = true;
            try {
                const response = await axios.get('/api/messages');
                this.messages = response.data.map(msg => ({
                    ...msg,
                    timestamp: new Date(msg.timestamp).toLocaleString()
                }));
            } catch (error) {
                alert('Failed to load messages.');
            } finally {
                this.isLoading = false;
            }
        },
        async postMessage() {
            if (!this.newMessage.trim()) return;
            try {
                await axios.post('/api/messages', { 
                    message: this.newMessage,
                    timestamp: new Date()
                });
                await this.loadMessages();
                this.newMessage = '';
            } catch (error) {
                alert('Failed to post message.');
            }
        },
        async deleteMessage(id) {
            try {
                await axios.delete(`/api/messages/${id}`);
                await this.loadMessages();
            } catch (error) {
                alert('Failed to delete message.');
            }
        },
        startEdit(message) {
            this.editingMessage = message.id;
            this.editText = message.message;
        },
        cancelEdit() {
            this.editingMessage = null;
            this.editText = '';
        },
        async saveEdit() {
            if (!this.editText.trim()) return;
            try {
                await axios.put(`/api/messages/${this.editingMessage}`, {
                    message: this.editText
                });
                await this.loadMessages();
                this.cancelEdit();
            } catch (error) {
                alert('Failed to update message.');
            }
        }
    }
}).mount('#app');