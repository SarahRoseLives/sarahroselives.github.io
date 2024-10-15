document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const postName = urlParams.get('postname'); // Get the postname from the query string
    console.log('Post name from URL:', postName); // Debugging line to check the value
    const postsPath = 'assets/posts/'; // Path to the posts

    // Initialize showdown converter with line break preservation
    const converter = new showdown.Converter({
        ghCodeBlocks: true,          // Enable GitHub-style code blocks
        simpleLineBreaks: true,      // Preserve line breaks in Markdown
        requireSpaceBeforeHeadingText: true // Ensure proper spacing before headings
    });

    if (postName) {
        try {
            // Fetch the markdown file
            const response = await fetch(`${postsPath}${postName}`);
            if (!response.ok) throw new Error(`Failed to fetch post: ${response.statusText}`);

            const markdownContent = await response.text();
            let htmlContent = converter.makeHtml(markdownContent);

            // Convert double newlines to <br><br> for extra line spacing
            htmlContent = htmlContent.replace(/\n{2}/g, '<br><br>');

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
        console.warn('No post specified in URL.');
        document.getElementById('post').innerHTML = '<p>No post specified.</p>';
    }
});
