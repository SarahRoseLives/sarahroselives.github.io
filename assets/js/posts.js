document.addEventListener('DOMContentLoaded', (event) => {
    if (typeof showdown !== 'undefined') {
        console.log('showdown.js loaded successfully');
        const POSTS_PER_PAGE = 5;
        let allPosts = [];
        let currentPage = 1;
        const postsPath = 'assets/posts/'; // The common path to the posts

        // Enable GitHub-style code blocks
        const converter = new showdown.Converter({ ghCodeBlocks: true });

        const loadPosts = async () => {
            try {
                const fileListResponse = await fetch('assets/json/file-list.json');
                if (!fileListResponse.ok) throw new Error(`Failed to fetch file list: ${fileListResponse.statusText}`);
                const markdownFiles = await fileListResponse.json();

                // Prepend the common path to each post file
                const fetchPromises = markdownFiles.map(file => {
                    const filePath = postsPath + file; // Prepend the common path
                    return fetch(filePath)
                        .then(response => {
                            if (!response.ok) {
                                console.error('Failed to fetch:', filePath, response.status, response.statusText);
                                return null;
                            }
                            return response.text().then(content => {
                                const title = file
                                const htmlContent = converter.makeHtml(content);  // Convert markdown to HTML
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
                postElement.innerHTML = `<h2>${post.title}</h2>${post.content}`;
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
