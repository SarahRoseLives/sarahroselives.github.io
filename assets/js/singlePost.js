document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const postName = urlParams.get('postname'); // Get the postname from the query string
    console.log('Post name from URL:', postName); // Debugging line to check the value
    const postsPath = 'assets/posts/'; // Path to the posts
    const converter = new showdown.Converter({ ghCodeBlocks: true });

    if (postName) {
        try {
            // Fetch the markdown file
            const response = await fetch(`${postsPath}${postName}`);
            if (!response.ok) throw new Error(`Failed to fetch post: ${response.statusText}`);

            const markdownContent = await response.text();
            const htmlContent = converter.makeHtml(markdownContent);
            document.getElementById('post').innerHTML = htmlContent;

            // Apply syntax highlighting to code blocks
            document.querySelectorAll('pre code').forEach((block) => {
                hljs.highlightBlock(block);
            });
        } catch (error) {
            console.error('Error loading post:', error);
            document.getElementById('post').innerHTML = '<p>Sorry, the post could not be loaded.</p>';
        }
    } else {
        console.warn('No post specified in URL.'); // Debugging line
        document.getElementById('post').innerHTML = '<p>No post specified.</p>';
    }
});
