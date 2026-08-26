export const SAMPLE_COURSE_MARKDOWN = `# 📚 Course Syllabus & Overview

Welcome to the course! This document outlines the curriculum, evaluation criteria, laboratory policies, and recommended learning resources.

---

## 🎯 Learning Objectives

By the conclusion of this semester, students will have mastered:
1. **Theoretical Foundations**
   - Core computational models and underlying data architecture.
   - Algorithmic complexity analysis and asymptotic efficiency.
2. **Practical Engineering Skills**
   - Writing concurrent, high-throughput applications in modern systems languages.
   - Debugging memory leaks, data races, and cache misses with profiling tools.

> **Important Policy Note:**
> Attendance in all laboratory and seminar sessions is mandatory (minimum 80% attendance required to sit for the final exam).
> Late submissions will incur a 10% penalty per calendar day up to a maximum of 3 days.

---

## 📋 Evaluation & Grading Breakdown

The final course grade is computed based on the following weighted formula:

| Component | Weight | Minimum Threshold | Description |
| :--- | :---: | :---: | :--- |
| **Final Exam** | \`40%\` | ≥ 4.50 / 10 | Written theoretical exam + algorithm problem solving |
| **Midterm Evaluation** | \`20%\` | None | Multiple-choice quiz & systems architecture design |
| **Laboratory Projects** | \`30%\` | ≥ 5.00 / 10 | Bi-weekly coding assignments & peer code reviews |
| **Class Activity** | \`10%\` | None | Seminars, participation, & active discussions |

---

## 🛠️ Required Toolchain & Setup

Make sure your local workstation environment is configured before the first laboratory session:

- [x] Install **GCC / Clang** (version ≥ 14.0) or **Rust toolchain**
- [x] Configure **CMake** or **Cargo** build systems
- [x] Set up **GDB / LLDB** with Valgrind / AddressSanitizer
- [ ] Clone the official course repository:
  \`\`\`bash
  git clone https://github.com/unihub-platform/course-starter.git
  cd course-starter && make setup
  \`\`\`

### 💻 Code Example: Concurrent Thread Pool

Below is a reference implementation of the concurrency model studied in Chapter 4:

\`\`\`typescript
interface Task<T> {
  id: string;
  execute: () => Promise<T>;
}

export class AsyncWorkerPool<T> {
  private queue: Task<T>[] = [];
  private activeWorkers = 0;

  constructor(private readonly maxConcurrency = 4) {}

  async submit(task: Task<T>): Promise<void> {
    this.queue.push(task);
    this.processNext();
  }

  private async processNext(): Promise<void> {
    if (this.activeWorkers >= this.maxConcurrency || this.queue.length === 0) {
      return;
    }
    const task = this.queue.shift()!;
    this.activeWorkers++;
    try {
      await task.execute();
    } finally {
      this.activeWorkers--;
      this.processNext();
    }
  }
}
\`\`\`

---

## 📖 Recommended Bibliography & Links

- *Computer Systems: A Programmer's Perspective* (3rd Edition) – R. Bryant & D. O'Hallaron
- *Operating Systems: Three Easy Pieces* – R. Arpaci-Dusseau & A. Arpaci-Dusseau
- [Official UniHub Course Documentation & Notes](https://unihub.edu/resources)
- [Interactive Systems Architecture Visualizer](https://visualgo.net)

---

### ⚠️ Academic Integrity Policy
All submitted assignments are scanned using automated plagiarism detection algorithms. Collaboration on concepts is encouraged, but **all code submitted must be written individually**.
`;
