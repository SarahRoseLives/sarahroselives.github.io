document.addEventListener('DOMContentLoaded', (event) => {
    if (typeof showdown !== 'undefined') {
        console.log('showdown.js loaded successfully');
        const POSTS_PER_PAGE = 5;
        let allPosts = [];
        let currentPage = 1;
        const postsPath = 'assets/posts/';
        const imagesPath = 'assets/posts/images/';

        // Enable GitHub-style code blocks and preserve line breaks
        const converter = new showdown.Converter({
            ghCodeBlocks: true,
            simpleLineBreaks: true, // Enable auto line breaks
            requireSpaceBeforeHeadingText: true
        });

        const loadPosts = async () => {
            try {
                const fileListResponse = await fetch('assets/json/file-list.json');
                if (!fileListResponse.ok) throw new Error(`Failed to fetch file list: ${fileListResponse.statusText}`);
                const markdownFiles = await fileListResponse.json();

                const fetchPromises = markdownFiles.map(file => {
                    const filePath = postsPath + file;
                    return fetch(filePath)
                        .then(response => {
                            if (!response.ok) {
                                console.error('Failed to fetch:', filePath, response.status, response.statusText);
                                return null;
                            }
                            return response.text().then(content => {
                                const title = file;
                                let htmlContent = converter.makeHtml(content);

                                // Convert double newlines to <br><br> for extra line spacing
                                htmlContent = htmlContent.replace(/\n{2}/g, '<br><br>');

                                // Update image paths
                                htmlContent = htmlContent.replace(/src="images\//g, `src="${imagesPath}`);

                                return { title, content: htmlContent };
                            });
                        });
                });

                const postsArray = await Promise.all(fetchPromises);
                allPosts = postsArray.filter(post => post !== null);

                // Reverse the posts to show the newest posts first
                allPosts.reverse();

                displayPosts(currentPage);
            } catch (error) {
                console.error('Error loading posts:', error);
            }
        };

        const displayPosts = (page) => {
            const postsContainer = document.getElementById('posts');
            const paginationContainer = document.getElementById('pagination');
            postsContainer.innerHTML = '';
            paginationContainer.innerHTML = '';
            const start = (page - 1) * POSTS_PER_PAGE;
            const end = start + POSTS_PER_PAGE;
            const postsToDisplay = allPosts.slice(start, end);
            postsToDisplay.forEach(post => {
                const postElement = document.createElement('div');
                postElement.className = 'post';

                // Create a link for the title that points to the individual post page
                const postTitle = document.createElement('h2');
                const postLink = document.createElement('a');
                postLink.href = `/posts.html?postname=${encodeURIComponent(post.title)}`;
                postLink.innerText = post.title;
                postTitle.appendChild(postLink);
                postElement.appendChild(postTitle);

                postElement.innerHTML += post.content; // Append the post content
                postsContainer.appendChild(postElement);
            });

            // Apply syntax highlighting to code blocks
            document.querySelectorAll('pre code').forEach((block) => {
                hljs.highlightBlock(block);
            });

            const totalPages = Math.ceil(allPosts.length / POSTS_PER_PAGE);
            if (totalPages > 1) {
                if (page > 1) {
                    const prevButton = document.createElement('button');
                    prevButton.innerText = 'Previous';
                    prevButton.onclick = () => displayPosts(page - 1);
                    paginationContainer.appendChild(prevButton);
                }
                if (page < totalPages) {
                    const nextButton = document.createElement('button');
                    nextButton.innerText = 'Next';
                    nextButton.onclick = () => displayPosts(page + 1);
                    paginationContainer.appendChild(nextButton);
                }
            }
        };

        loadPosts();
    } else {
        console.error('showdown.js is not loaded.');
    }
});
