# Welcome to your FitSync

## Project description

Local AI calculations and algorithms. Modern, minimalist design with animations, uniform colour palette and a maximum of three fonts. 

When opening the app for the first time, the user is redirected to a welcome page and then to the login page. The app supports multiple users. On the login page, the ‘Register’ link leads to the registration page where users can register. Clicking ‘Register’ creates a unique key and a matching lock that is securely stored in the backend. This lock encrypts all user data stored on the device. The user then enters their date of birth, height and weight and estimates their fitness level. They are then redirected to the start page, while the software is customised for them in the background. Height and weight can be changed via the problem bar and saved on the device. Once the user has successfully logged in, they can access their data. If another user is logged in, the key will not match and the user will not be able to access the other user's data. Each user only sees their own data. After logging in, all decrypted data is applied, the systems are booted up and the user is redirected to the start page.
You can create your workout manually, use a workout created by AI or scan a training plan with the camera. The AI recognises the plan and creates a corresponding workout. The workouts are saved in the training area and take into account your last workouts to create variety and avoid overexertion. In the manual settings, you select exercise blocks and string them together. You can change the repetitions, duration and breaks. There is a large selection of equipment. Confirm your settings to start training. If you select AI-generated training, you will see the training sequence and can start training. All important data is recorded during the training session. After completing the training, you will receive an AI-based evaluation based on your performance and the AI rating. There is a self-assessment area on the training plan creation page. All training plans created can be saved and started later via a box on the start page of the fitness studio.
In the event of injuries, such as a broken bone, you can inform the AI of this via an input field. It automatically adapts the training plan, e.g. in the event of a broken arm, to protect the arm. The problem bar appears on the training plan creation page and the start page. Like a search bar, it stretches along almost the entire length of the bottom, with the telegram arrow to the right for sending the message. 

During the training phase, a silent video of the exercise is played. The remaining sets, the training duration and the heart rate are displayed. A button allows you to end an exercise prematurely or skip it. Saved workouts can be removed from the list. A test set without weights should be completed before each exercise. This also applies to the Watch OS version. A break should be taken after each set and when changing devices. The AI adjusts the user's ranking after each workout. The current ranking is displayed at the top right of the start page. A ten-minute warm-up phase on the bike or treadmill is scheduled before training. 

At the end of the workout, heart rate, calories burned and oxygen saturation are recorded. During this time, user and ambient noise is recorded. The AI analyses this data, including groaning noises. If an exercise is recognised as too extreme, the AI compares it with past workouts to identify the exercise that is too hard. This is taken into account in the next workout generation, e.g. by reducing the weights.



**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. 

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <(https://github.com/moin-64/FitSync.git)>

# Step 2: Navigate to the project directory.
cd <FitSync>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with .

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
