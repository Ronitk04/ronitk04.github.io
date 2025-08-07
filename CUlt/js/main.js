document.addEventListener('DOMContentLoaded', () => {
    const gameHeader = document.getElementById('game-header');
    const chapterTitle = document.getElementById('chapter-title');

    // Modals
    const inventoryButton = document.getElementById('inventory-button');
    const inventoryModal = document.getElementById('inventory-modal');
    const closeInventoryButton = document.getElementById('close-inventory-button');
    const inventoryList = document.getElementById('inventory-list');
    const loreModal = document.getElementById('lore-modal');
    const loreText = document.getElementById('lore-text');
    const closeLoreButton = document.getElementById('close-lore-button');

    // Screens
    const startScreen = document.getElementById('start-screen');
    const chapterScreen = document.getElementById('chapter-screen');
    const puzzleScreen = document.getElementById('puzzle-screen');
    const endingScreen = document.getElementById('ending-screen');

    // Buttons
    const startButton = document.getElementById('start-button');
    const restartButton = document.getElementById('restart-button');

    // Content Elements
    const gameContent = document.getElementById('game-content');
    const storyText = document.getElementById('story-text');
    const choicesContainer = document.getElementById('choices-container');
    const puzzleContainer = document.getElementById('puzzle-container');
    const endingTitle = document.getElementById('ending-title');
    const endingText = document.getElementById('ending-text');
    const particleContainer = document.getElementById('particle-container');

    let gameState = {};

    const loreData = {
        'lore_aethelred': 'FILE: Aethelred_Notes.txt\n\nNamed for the Unready King. A reminder that power unprepared is power surrendered. We shall not be unready. All assets must flow through this single, controllable point. It is the heart that pumps the blood of capital.',
        'lore_rituals': 'FILE: Ritual_Fragments.txt\n\n...the flesh is a temporary vessel, but capital is an eternal current. The Convergence will amplify the collective will, but only the worthy may conduct. The unworthy are... consumed by the market\'s correction. Their assets are reallocated.',
        'lore_founder': 'FILE: Founder_Bio_REDACTED.txt\n\nBorn [REDACTED]. Died [REDACTED]. Or did he? The archives show a transfer of all personal assets into a blind trust named "Ouroboros Ventures" moments before his declared death. The trust\'s charter is set to execute upon the successful completion of The Convergence. He did not build a legacy; he built a cocoon.'
    };

    const storyData = {
        'start': {
            chapter: 'SYSTEM BOOT',
            text: `> Secure line detected.\n> Anonymous message received.\n\n[1 Attachment: data_packet_01.zip]\n\nBody: They see you. Find the root. The eye of the pyramid is blind.`,
            choices: [
                { text: 'Extract data_packet_01.zip', nodeId: 'extract_packet' },
                { text: 'Run a trace on the sender\'s IP.', nodeId: 'trace_ip_fail' },
                { text: 'Analyze the phrase "The eye of the pyramid is blind."', nodeId: 'analyze_phrase_fail' }
            ]
        },
        'trace_ip_fail': {
            chapter: 'SYSTEM ERROR',
            text: '> TRACE INITIATED...\n> ERROR: IP masked by cascading proxy network. Back-trace triggered a security alert on an unknown server. You feel a chill, the distinct sensation of being watched. This was a mistake.',
            choices: [
                { text: 'Return to the message.', nodeId: 'start' }
            ]
        },
        'analyze_phrase_fail': {
            chapter: 'ANALYSIS',
            text: '> Running semantic analysis...\n> "Pyramid" correlates to hierarchical power structures. "Eye" correlates to surveillance, oversight. "Blind" implies a vulnerability, a lack of insight at the highest level.\n> The statement is a paradox. Interesting, but not immediately actionable. A distraction.',
            choices: [
                { text: 'Focus on the attachment.', nodeId: 'extract_packet' }
            ]
        },
        'extract_packet': {
            chapter: 'DATA EXTRACTION',
            text: '> Extracting data_packet_01.zip...\n> 1 file found: "symbols.txt"\n> 1 file found: "locations.dat"\n\n> Which file to open?',
            choices: [
                { text: 'Open symbols.txt', nodeId: 'open_symbols' },
                { text: 'Open locations.dat', nodeId: 'open_locations' }
            ]
        },
        'open_locations': {
            chapter: 'DATA CORRUPTED',
            text: '> Accessing locations.dat...\n> ERROR: File is encrypted. Key required. The file header contains a single, repeating symbol: ⨝. It seems meaningless without context.',
            addItem: 'Encrypted Coordinates (⨝)',
            choices: [
                { text: 'Examine the other file.', nodeId: 'open_symbols' }
            ]
        },
        'open_symbols': {
            chapter: 'SYMBOL ANALYSIS',
            text: '> Opening symbols.txt...\n> The file contains three symbols, each paired with a corporate entity:\n\n⨝ : Aethelred Holdings\n⬙ : Meridian Global\n⟐ : Chronos Logistics\n\n> Aethelred Holdings... their symbol matches the encryption key on the location file. This must be the "root" the message mentioned.',
            lore: { 'Aethelred Holdings': 'lore_aethelred' },
            choices: [
                { text: 'Investigate Aethelred Holdings directly. (Go to the location)', nodeId: 'go_to_aethelred' },
                { text: 'Research Meridian Global. They seem suspicious.', nodeId: 'research_meridian_fail' },
                { text: 'Look into Chronos Logistics. What do they transport?', nodeId: 'research_chronos_fail' }
            ]
        },
        'research_meridian_fail': {
            chapter: 'DEAD END',
            text: '> You spend hours digging into Meridian Global. They\'re a data analytics firm with government contracts. It\'s sinister, but clean. Too clean. You\'ve wasted valuable time chasing a ghost. The trail has gone cold.',
            choices: [
                { text: 'Re-focus on Aethelred Holdings.', nodeId: 'go_to_aethelred' }
            ]
        },
        'research_chronos_fail': {
            chapter: 'MISDIRECTION',
            text: '> Chronos Logistics has a fleet of armored trucks. You track one, hoping for a clue. After a tense night of surveillance, you watch it deliver... pallets of high-end printer paper to an office building. You\'ve been completely sidetracked.',
            choices: [
                { text: 'It has to be Aethelred. Go there.', nodeId: 'go_to_aethelred' }
            ]
        },
        'go_to_aethelred': {
            chapter: 'THE LION\'S DEN',
            text: '> The encrypted coordinates resolve to a discreet, opulent brownstone in the financial district - the headquarters of Aethelred Holdings. The place feels ancient, disguised by a veneer of modern wealth. The front door is impassable. You spot a keypad by a service entrance in the alley.',
            choices: [
                { text: 'Attempt to hack the keypad.', nodeId: 'puzzle_keypad' },
                { text: 'Look for another way in.', nodeId: 'find_window' },
                { text: 'Wait and watch.', nodeId: 'wait_watch_fail' }
            ]
        },
        'wait_watch_fail': {
            chapter: 'SPOTTED',
            text: '> You wait in the shadows, observing. Too long. A sleek black car pulls up, and men in sharp suits emerge. One of them looks directly at your hiding spot, a cold, knowing smile on his face. He gestures, and two others start walking towards you. You have to run, the opportunity lost.',
            choices: [
                { text: 'Escape and rethink your approach.', nodeId: 'go_to_aethelred' }
            ]
        },
        'find_window': {
            chapter: 'A SLIVER OF OPPORTUNITY',
            text: '> You circle the building. High up, a single window is slightly ajar. It\'s a difficult climb up an old fire escape, but possible. The risk of being seen is high, but the front is a dead end.',
            choices: [
                { text: 'Make the climb.', nodeId: 'climb_window' },
                { text: 'It\'s too risky. Go back to the keypad.', nodeId: 'puzzle_keypad' }
            ]
        },
        'puzzle_keypad': {
            puzzle: true,
            type: 'password',
            chapter: 'KEYPAD PUZZLE',
            text: '> The keypad glows faintly. It\'s not a standard numerical pad. It shows a series of symbols. You recall the files: Aethelred (⨝), Meridian (⬙), Chronos (⟐). The message said to "Find the root." Aethelred is the root, but what is its purpose? The decoded ritual from your research comes to mind: "Control, Secrecy, Transformation." Which concept defines a holding company?',
            puzzleData: {
                prompt: 'Enter the password (a single word):',
                solution: 'CONTROL',
                successNode: 'enter_basement',
                failNode: 'keypad_fail'
            }
        },
        'keypad_fail': {
            chapter: 'ACCESS DENIED',
            text: '> INCORRECT. A shrill, silent alarm flashes on the keypad before it goes dark. You hear the distinct sound of a lock engaging from inside. This door is no longer an option.',
            choices: [
                { text: 'The window is the only way now.', nodeId: 'find_window' }
            ]
        },
        'climb_window': {
            chapter: 'INFILTRATION',
            text: '> The climb is harrowing. Bricks crumble under your fingers. You finally pull yourself through the window into a lavish, empty office. It smells of old paper and expensive leather. A computer on a large oak desk is unlocked, displaying internal memos.',
            addItem: 'Access to Aethelred Office',
            choices: [
                { text: 'Read the internal memos.', nodeId: 'read_memos' },
                { text: 'Search the desk for physical files.', nodeId: 'search_desk_fail' }
            ]
        },
        'search_desk_fail': {
            chapter: 'A WASTE OF TIME',
            text: '> You rifle through the drawers. They contain nothing but shareholder reports and expensive stationery. This organization is too careful to leave physical evidence lying around. The computer is the key.',
            choices: [
                { text: 'Read the internal memos on the computer.', nodeId: 'read_memos' }
            ]
        },
        'enter_basement': {
            chapter: 'THE ROOT',
            text: '> The password works. The door clicks open, not into a hallway, but onto a stone staircase leading down. The air grows cold. You descend into a modern, climate-controlled archive. This is the real heart of Aethelred Holdings: a library of secrets.',
            addItem: 'Access to Aethelred Archive',
            choices: [
                { text: 'Search for files on "The Convergence."', nodeId: 'search_convergence' },
                { text: 'Look for personnel files.', nodeId: 'search_personnel_fail' },
                { text: 'Examine the strange stonework on the wall.', nodeId: 'easter_egg_founder' }
            ]
        },
        'easter_egg_founder': {
            chapter: 'BENEATH THE FOUNDATION',
            text: '> One of the stones is different. It feels... newer. You push, and it gives way, revealing a small, hidden compartment. Inside is a single, leather-bound journal. The entries are old, written by the Order\'s founder. The final entry is chilling.',
            lore: { 'journal': 'lore_founder' },
            choices: [
                { text: 'This is too deep. Focus on the main plan.', nodeId: 'search_convergence' }
            ]
        },
        'search_personnel_fail': {
            chapter: 'REDACTED',
            text: '> You find the personnel files, but they are heavily redacted. Names are replaced with codenames, histories with abstract summaries. It\'s a dead end. You need to find out what they are planning, not who they are.',
            choices: [
                { text: 'Search for "The Convergence."', nodeId: 'search_convergence' }
            ]
        },
        'read_memos': {
            chapter: 'BREADCRUMBS',
            text: '> The memos are cryptic. They speak of "asset allocation" for Project Convergence and "leveraging Chronos for primary distribution." One memo stands out, a complaint about the archive\'s cooling system being too loud during rituals. The archive... that must be where the real information is.',
            lore: { 'rituals': 'lore_rituals' },
            choices: [
                { text: 'Find a way to the archive.', nodeId: 'find_archive' }
            ]
        },
        'find_archive': {
            chapter: 'THE SECRET STAIRS',
            text: '> You find a schematic of the building hidden in a desktop folder. It shows a hidden elevator behind a bookshelf. You activate it and descend into the same stone-walled archive you would have found through the service entrance.',
            choices: [
                { text: 'Search for files on "The Convergence."', nodeId: 'search_convergence' },
                { text: 'Examine the strange stonework on the wall.', nodeId: 'easter_egg_founder' }
            ]
        },
        'search_convergence': {
            chapter: 'THE PLAN',
            text: '> You find the master file. "The Convergence" is a plan to trigger a global financial collapse, allowing the Order to seize control of key industries using their vast, hidden wealth. The final phase is imminent. The file lists three targets for destabilization, but only one is the linchpin. You must leak the correct file to the press to expose them without causing worldwide panic.',
            addItem: 'Convergence Master File',
            choices: [
                { text: 'Leak the file on the Global Stock Exchange manipulation.', nodeId: 'goodEnding' },
                { text: 'Leak the file on the agricultural sabotage.', nodeId: 'neutralEnding' },
                { text: 'Leak the entire master file. All of it.', nodeId: 'badEnding' }
            ]
        },
        'goodEnding': {
            ending: true,
            title: 'THE SURGICAL STRIKE',
            text: 'You leak the single, critical file. It\'s enough. Investigations begin, focused solely on market manipulation. Aethelred Holdings is dismantled. The Order is cut off from its primary financial weapon. The Convergence is averted. They are wounded, not killed, but you have won the battle. You fade back into the shadows, a silent guardian.'
        },
        'neutralEnding': {
            ending: true,
            title: 'THE SCARE',
            text: 'Leaking the agricultural file causes a panic. Food prices skyrocket. There are riots. In the chaos, the Order\'s financial coup goes unnoticed. They fail to take over everything, but they solidify their power over the world\'s food supply. You stopped The Convergence, but created a different kind of monster. The world is fed, but it is not free.'
        },
        'badEnding': {
            ending: true,
            title: 'THE FLOOD',
            text: 'You leak everything. The sheer volume of data is overwhelming. It implicates governments, banks, charities. No one knows who to trust. The world descends into paranoid chaos. The global economy evaporates. The Order, prepared for this, rises from the ashes to enforce their new world. You tried to save everyone, and in doing so, you handed them the world on a silver platter.'
        }
    };

    function startGame() {
        gameState = {
            currentNode: 'start',
            inventory: []
        };
        updateInventoryDisplay();
        goToNode('start');
    }

    function showScreen(screenElement) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        screenElement.classList.add('active');
    }

    function goToNode(nodeId) {
        const node = storyData[nodeId];
        if (!node) return;

        gameState.currentNode = nodeId;

        if (node.ending) {
            renderEnding(node);
        } else if (node.puzzle) {
            renderPuzzle(node);
        } else {
            renderChapter(node);
        }

        if (node.addItem) {
            addToInventory(node.addItem);
        }
    }

    function revealWithGlitch(element, text) {
        let i = 0;
        element.innerHTML = '';
        const interval = setInterval(() => {
            if (i < text.length) {
                const char = text[i];
                if (Math.random() < 0.1) { // 10% chance to glitch
                    const glitchChar = String.fromCharCode(Math.random() * (126 - 33) + 33);
                    element.innerHTML = text.substring(0, i) + `<span style="color:var(--accent-red);">${glitchChar}</span>`;
                } else {
                    element.innerHTML = text.substring(0, i + 1);
                }
                i++;
            } else {
                clearInterval(interval);
                element.innerHTML = text; // Ensure final text is correct
                addLoreListeners(element, storyData[gameState.currentNode]);
            }
        }, 50); // Adjust speed of reveal here
    }

    function addLoreListeners(element, node) {
        if (node.lore) {
            let currentText = element.innerHTML;
            for (const keyword in node.lore) {
                const loreId = node.lore[keyword];
                const regex = new RegExp(`\\b(${keyword})\\b`, 'gi');
                currentText = currentText.replace(regex, `<span class="clickable-lore" data-lore-id="${loreId}">$1</span>`);
            }
            element.innerHTML = currentText;

            element.querySelectorAll('.clickable-lore').forEach(span => {
                span.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const loreId = e.target.dataset.loreId;
                    showLore(loreId);
                });
            });
        }
    }

    function renderChapter(node) {
        gameHeader.classList.remove('hidden');
        chapterTitle.textContent = `> ${node.chapter}`;

        choicesContainer.innerHTML = '';

        revealWithGlitch(storyText, node.text);

        node.choices.forEach(choice => {
            const button = document.createElement('button');
            button.classList.add('choice-button');
            button.textContent = choice.text;
            button.onclick = () => goToNode(choice.nodeId);
            choicesContainer.appendChild(button);
        });

        showScreen(chapterScreen);
        gameContent.scrollTop = 0;
    }

    function renderEnding(node) {
        gameHeader.classList.add('hidden');
        endingTitle.textContent = node.title;
        revealWithGlitch(endingText, node.text);
        showScreen(endingScreen);
    }

    function renderPuzzle(node) {
        gameHeader.classList.remove('hidden');
        chapterTitle.textContent = `> ${node.chapter}`;
        puzzleContainer.innerHTML = '';

        const puzzleContent = document.createElement('div');
        puzzleContent.innerHTML = `
            <div class="story-text-wrapper"><p class="story-text">${node.text}</p></div>
            <h2>${node.puzzleData.prompt}</h2>
        `;

        if (node.type === 'password') {
            const input = document.createElement('input');
            input.type = 'text';
            input.id = 'puzzle-input';
            input.classList.add('puzzle-input');
            input.autofocus = true;
            puzzleContent.appendChild(input);
        }

        const submitButton = document.createElement('button');
        submitButton.textContent = 'SUBMIT';
        submitButton.classList.add('button-primary');
        submitButton.style.marginTop = '1rem';
        submitButton.onclick = () => solvePuzzle(node);
        puzzleContent.appendChild(submitButton);

        puzzleContainer.appendChild(puzzleContent);
        showScreen(puzzleScreen);
    }

    function solvePuzzle(node) {
        let isCorrect = false;
        if (node.type === 'password') {
            const input = document.getElementById('puzzle-input').value.toUpperCase();
            if(input === node.puzzleData.solution) {
                isCorrect = true;
            }
        }

        goToNode(isCorrect ? node.puzzleData.successNode : node.puzzleData.failNode);
    }

    function addToInventory(item) {
        if (!gameState.inventory.includes(item)) {
            gameState.inventory.push(item);
            updateInventoryDisplay();
        }
    }

    function updateInventoryDisplay() {
        inventoryList.innerHTML = '';
        if (gameState.inventory.length === 0) {
            inventoryList.innerHTML = '<li>EMPTY</li>';
        } else {
            gameState.inventory.forEach(item => {
                const li = document.createElement('li');
                li.textContent = `> ${item}`;
                inventoryList.appendChild(li);
            });
        }
    }

    function showLore(loreId) {
        const lore = loreData[loreId];
        if (lore) {
            loreText.textContent = lore;
            loreModal.style.display = 'flex';
        }
    }

    function createParticles() {
        for (let i = 0; i < 30; i++) {
            const particle = document.createElement('div');
            particle.classList.add('particle');
            const size = Math.random() * 3 + 1;
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            particle.style.left = `${Math.random() * 100}vw`;
            particle.style.animationDuration = `${Math.random() * 5 + 5}s`;
            particle.style.animationDelay = `${Math.random() * 5}s`;
            particleContainer.appendChild(particle);
        }
    }

    // --- Event Listeners ---
    startButton.addEventListener('click', startGame);
    restartButton.addEventListener('click', () => {
        showScreen(startScreen);
    });
    inventoryButton.addEventListener('click', () => {
        inventoryModal.style.display = 'flex';
    });
    closeInventoryButton.addEventListener('click', () => {
        inventoryModal.style.display = 'none';
    });
    closeLoreButton.addEventListener('click', () => {
        loreModal.style.display = 'none';
    });

    // --- Initial Setup ---
    createParticles();
});
