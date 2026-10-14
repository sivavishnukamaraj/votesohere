
const candidates = [
    {
        id: 1,
        name: "C. Joseph Vijay",
        party: "Tamilaga Vettri Kazhagam",
        initials: "TVK",
        symbol: "📯",
        color: "#2864E8",
        light: "#EDF3FF",
        partyColors: ["#E5A629", "#2864E8"]
    },
    {
        id: 2,
        name: "M. K. Stalin",
        party: "Dravida Munnetra Kazhagam",
        initials: "DMK",
        symbol: "🌅",
        color: "#DC2626",
        light: "#FFF0F0",
        partyColors: ["#000000", "#DC2626"]
    },
    {
        id: 3,
        name: "Edappadi K. Palaniswami",
        party: "All India Anna Dravida Munnetra Kazhagam",
        initials: "AIADMK",
        symbol: "🍃",
        color: "#16855B",
        light: "#E7F7EF",
        partyColors: ["#16855B", "#DC2626"]
    },
    {
        id: 4,
        name: "Anbumani Ramadoss",
        party: "Pattali Makkal Katchi",
        initials: "PMK",
        symbol: "🥭",
        color: "#9333EA",
        light: "#F4EAFF",
        partyColors: ["#16855B", "#FFFFFF", "#FFD700"]
    }
];

const STORAGE_KEY = "votesphere_demo_data";

let selectedCandidate = null;
let toastTimer;

const $ = (id) => document.getElementById(id);

function loadData() {
    const initial = {
        votes: { 1: 0, 2: 0, 3: 0, 4: 0 },
        hasVoted: false,
        votedCandidate: null
    };

    try {
        const saved = localStorage.getItem(STORAGE_KEY);

        if (!saved) return initial;

        const data = JSON.parse(saved);

        if (
            !data ||
            typeof data.votes !== "object" ||
            data.votes === null
        ) {
            return initial;
        }

        const votes = {};

        for (const candidate of candidates) {
            const value = data.votes[candidate.id];

            if (
                !Number.isSafeInteger(value) ||
                value < 0 ||
                value > 255
            ) {
                return initial;
            }

            votes[candidate.id] = value;
        }

        const hasVoted = data.hasVoted === true;
        const votedCandidate = data.votedCandidate;

        if (
            hasVoted &&
            !candidates.some(c => c.id === votedCandidate)
        ) {
            return initial;
        }

        return { votes, hasVoted, votedCandidate };
    } catch {
        return initial;
    }
}

let election = loadData();

function saveData() {
    try {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(election)
        );
        return true;
    } catch {
        showToast("Browser storage unavailable. Changes may not persist.");
        return false;
    }
}

// Create the candidate cards
function renderCandidates() {
    $("candidateGrid").innerHTML = candidates.map(candidate => {
        const isSelected =
            election.hasVoted &&
            election.votedCandidate === candidate.id;

        let buttonText = "Vote for candidate →";

        if (isSelected) {
            buttonText = "✓ Your selection";
        } else if (election.hasVoted) {
            buttonText = "Voting completed";
        }

        return `
            <article class="candidate-card">
                <div class="candidate-banner"
                     style="background:${candidate.color}"></div>

                <div class="candidate-inner">
                    <div class="candidate-avatar"
                         style="background:${candidate.light};
                                color:${candidate.color}">
                        ${candidate.initials}
                    </div>

                    <div class="candidate-number">
                        CANDIDATE 0${candidate.id}
                    </div>

                    <h3>${candidate.name}</h3>
                    <p class="candidate-party">${candidate.party}</p>

                    <div class="candidate-symbol"
                         aria-label="Candidate symbol">
                        ${candidate.symbol}
                    </div>

                    <button
                        class="vote-btn"
                        data-candidate="${candidate.id}"
                        ${election.hasVoted ? "disabled" : ""}
                    >
                        ${buttonText}
                    </button>
                </div>
            </article>
        `;
    }).join("");
}

// Update the statistics and result bars
function renderResults() {
    const total = candidates.reduce(
        (sum, candidate) => sum + election.votes[candidate.id],
        0
    );

    $("candidateTotal").textContent = candidates.length;
    $("totalVotes").textContent = total;
    $("resultsTotal").textContent = total;

    $("electionStatus").textContent =
        election.hasVoted ? "Vote cast" : "Open";

    $("resultsList").innerHTML = candidates.map(candidate => {
        const votes = election.votes[candidate.id];
        const percentage = total > 0
            ? (votes / total) * 100
            : 0;

        return `
            <div class="result-row">
                <div class="result-name">
                    <span class="result-dot"
                          style="background:${candidate.color}"></span>
                    <span>${candidate.name}</span>
                </div>

                <div class="progress-track"
                     role="progressbar"
                     aria-label="${candidate.name} vote share"
                     aria-valuemin="0"
                     aria-valuemax="100"
                     aria-valuenow="${percentage.toFixed(1)}">
                    <div class="progress-fill"
                         style="width:${percentage}%;
                                background:${candidate.color}">
                    </div>
                </div>

                <div class="result-value">
                    ${votes} <span style="color:#8491a5;font-weight:500">
                    (${percentage.toFixed(0)}%)</span>
                </div>
            </div>
        `;
    }).join("");
}

function renderApp() {
    renderCandidates();
    renderResults();
}

// Open the confirmation dialog
function openVoteModal(candidateId) {
    if (election.hasVoted) {
        showToast("You have already cast your demo vote.");
        return;
    }

    selectedCandidate = candidates.find(
        candidate => candidate.id === candidateId
    );

    if (!selectedCandidate) return;

    $("modalIcon").textContent = selectedCandidate.symbol;
    $("modalIcon").style.background = selectedCandidate.light;
    $("modalIcon").style.color = selectedCandidate.color;

    $("modalEyebrow").textContent = "CONFIRM YOUR CHOICE";
    $("modalTitle").textContent = "Cast your vote?";
    $("modalMessage").textContent =
        `You are selecting ${selectedCandidate.name}. ` +
        "You cannot change your selection in this demo after confirmation.";

    $("modalActions").style.display = "flex";
    $("confirmVote").style.display = "inline-flex";
    $("cancelVote").style.display = "inline-flex";
    $("closeModal").style.display = "block";

    $("voteModal").classList.add("open");
    $("voteModal").setAttribute("aria-hidden", "false");

    $("confirmVote").focus();
}

function closeVoteModal() {
    $("voteModal").classList.remove("open");
    $("voteModal").setAttribute("aria-hidden", "true");
    selectedCandidate = null;
}

// Confirm and record the demo vote
function confirmVote() {
    if (!selectedCandidate || election.hasVoted) {
        closeVoteModal();
        return;
    }

    const candidateId = selectedCandidate.id;

    if (election.votes[candidateId] >= 255) {
        showToast("This demo vote counter has reached its limit.");
        closeVoteModal();
        return;
    }

    const previous = {
        votes: { ...election.votes },
        hasVoted: election.hasVoted,
        votedCandidate: election.votedCandidate
    };

    election.votes[candidateId] += 1;
    election.hasVoted = true;
    election.votedCandidate = candidateId;

    if (!saveData()) {
        election = previous;
        closeVoteModal();
        renderApp();
        return;
    }

    const name = selectedCandidate.name;

    closeVoteModal();
    renderApp();

    $("modalIcon").textContent = "✓";
    $("modalIcon").style.background = "#e7f7ef";
    $("modalIcon").style.color = "#16855b";
    $("modalEyebrow").textContent = "VOTE RECORDED";
    $("modalTitle").textContent = "Thank you!";
    $("modalMessage").textContent =
        `Your demo vote for ${name} has been recorded in this browser.`;

    $("modalActions").style.display = "none";
    $("closeModal").style.display = "none";

    $("voteModal").classList.add("open");
    $("voteModal").setAttribute("aria-hidden", "false");

    showToast("Demo vote recorded successfully!");
}

// Show short notifications
function showToast(message) {
    const toast = $("toast");

    clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add("show");

    toastTimer = setTimeout(() => {
        toast.classList.remove("show");
    }, 2800);
}

// Candidate button clicks
$("candidateGrid").addEventListener("click", event => {
    const button = event.target.closest("[data-candidate]");

    if (!button || button.disabled) return;

    openVoteModal(Number(button.dataset.candidate));
});

$("confirmVote").addEventListener("click", confirmVote);
$("cancelVote").addEventListener("click", closeVoteModal);
$("closeModal").addEventListener("click", closeVoteModal);

$("voteModal").addEventListener("click", event => {
    if (event.target === $("voteModal")) {
        closeVoteModal();
    }
});

document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
        closeVoteModal();
    }
});

$("refreshResults").addEventListener("click", () => {
    election = loadData();
    renderApp();
    showToast("Demo results refreshed.");
});

// Initialize the website
renderApp();
