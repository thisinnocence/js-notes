new Vue({
    el: '#app',
    data: {
        newMessage: '',
        messages: []
    },
    created() {
        this.loadMessages();
    },
    methods: {
        loadMessages() {
            axios.get('/api/messages')
                .then(response => {
                    this.messages = response.data;
                })
                .catch(() => {
                    alert('Failed to load messages.');
                });
        },
        postMessage() {
            axios.post('/api/messages', { message: this.newMessage })
                .then(() => {
                    this.loadMessages();
                    this.newMessage = '';
                })
                .catch(() => {
                    alert('Failed to post message.');
                });
        }
    }
});