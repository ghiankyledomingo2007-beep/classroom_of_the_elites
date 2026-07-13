const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');

// 1. Simple .env parser (avoids dependency on dotenv)
function loadEnv() {
  const envPath = path.resolve(__dirname, '../.env');
  if (!fs.existsSync(envPath)) {
    console.error('No .env file found. Please create one.');
    process.exit(1);
  }
  const env = fs.readFileSync(envPath, 'utf-8');
  env.split('\n').forEach((line) => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let value = match[2] || '';
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.substring(1, value.length - 1);
      } else if (value.startsWith("'") && value.endsWith("'")) {
        value = value.substring(1, value.length - 1);
      }
      process.env[key] = value;
    }
  });
}

loadEnv();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const inviteSalt = process.env.INVITATION_CODE_SALT || 'default-salt';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials in .env file.');
  process.exit(1);
}

// 2. Initialize Supabase Admin Client
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Invitation code hashing helper
function hashInvite(code) {
  return crypto
    .createHmac('sha256', inviteSalt)
    .update(code.trim().toLowerCase())
    .digest('hex');
}

async function seed() {
  console.log('Starting ClassSpace database seeding...');

  try {
    // 3. Clear Existing Data
    console.log('Clearing existing data...');
    // We truncate tables to start fresh
    await supabase.rpc('truncate_all_tables'); // Or handle manually:
    await supabase.from('reports').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('announcements').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('projects').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('profiles').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('classrooms').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    const { data: { users: existingAuthUsers } } = await supabase.auth.admin.listUsers();
    for (const u of existingAuthUsers || []) {
      await supabase.auth.admin.deleteUser(u.id);
    }

    // 4. Create Fictional Classroom
    console.log('Creating classroom...');
    const inviteCode = 'welcome2026';
    const inviteHash = hashInvite(inviteCode);

    const { data: classroom, error: classError } = await supabase
      .from('classrooms')
      .insert({
        name: '11th Grade - Software Engineering',
        school_name: 'Oakridge Academy',
        school_year: '2025-2026',
        section_name: 'Section A',
        invitation_code_hash: inviteHash
      })
      .select()
      .single();

    if (classError) throw classError;
    console.log(`Classroom created. Invite code: "${inviteCode}". ID: ${classroom.id}`);

    // 5. Setup Fictional Users Data
    const usersToCreate = [
      {
        email: 'admin@oakridge.edu',
        password: 'password123',
        fullName: 'Mrs. Margaret Thompson',
        role: 'admin',
        status: 'approved',
        username: 'mrs_thompson',
        bio: 'Classroom Advisor and Computer Science teacher.'
      },
      {
        email: 'jane@oakridge.edu',
        password: 'password123',
        fullName: 'Jane Doe',
        role: 'student',
        status: 'approved',
        username: 'janedoe',
        bio: 'Coding enthusiast. HTML/CSS and Javascript showcase.',
        favorite_subjects: ['Computer Science', 'Mathematics'],
        skills: ['JavaScript', 'HTML/CSS', 'React'],
        interests: ['Web Development', 'UI Design'],
        hobbies: ['Chess', 'Photography'],
        achievements: ['Oakridge Hackathon 1st Place (2025)'],
        birthday: '2010-10-15',
        profile_accent: 'indigo'
      },
      {
        email: 'john@oakridge.edu',
        password: 'password123',
        fullName: 'John Smith',
        role: 'student',
        status: 'approved',
        username: 'johnsmith',
        bio: 'Aspiring robotics developer. Hardware & Python.',
        favorite_subjects: ['Physics', 'Robotics'],
        skills: ['Python', 'C++', 'Arduino'],
        interests: ['IoT', 'Embedded Systems'],
        hobbies: ['Robotics Club', 'Soccer'],
        achievements: ['National Robotics Olympiad Competitor'],
        birthday: '2010-04-12',
        profile_accent: 'blue'
      },
      {
        email: 'sarah@oakridge.edu',
        password: 'password123',
        fullName: 'Sarah Jenkins',
        role: 'student',
        status: 'approved',
        username: 'sarahj',
        bio: 'Creative designer and illustrator. Passionate about colors.',
        favorite_subjects: ['Art', 'History'],
        skills: ['Figma', 'Illustrator', 'CSS Grid'],
        interests: ['Graphic Design', 'Typography'],
        hobbies: ['Digital Painting', 'Skateboarding'],
        achievements: ['Oakridge Art Fair Showcase Winner'],
        birthday: '2010-07-22',
        profile_accent: 'rose'
      },
      {
        email: 'alex@oakridge.edu',
        password: 'password123',
        fullName: 'Alex Rivera',
        role: 'student',
        status: 'approved',
        username: 'alex_rivera',
        bio: 'Data geek. Mathematics, statistics, and database queries.',
        favorite_subjects: ['Mathematics', 'Statistics'],
        skills: ['SQL', 'Python', 'Excel'],
        interests: ['Data Analysis', 'Machine Learning'],
        hobbies: ['Rubik Cube Solving', 'Video Games'],
        achievements: ['Math Contest 2nd Place'],
        birthday: '2010-08-05',
        profile_accent: 'emerald'
      },
      {
        email: 'guest@oakridge.edu',
        password: 'guest123',
        fullName: 'Guest Visitor',
        role: 'student',
        status: 'approved',
        username: 'guest_user',
        bio: 'Exploring ClassSpace student directory and portfolio showcase!',
        favorite_subjects: ['Computer Science', 'Web Engineering'],
        skills: ['React', 'Next.js', 'Tailwind CSS', 'TypeScript'],
        interests: ['EdTech', 'Open Source'],
        hobbies: ['Exploring Web Apps'],
        achievements: ['ClassSpace Guest Explorer'],
        birthday: '2008-01-01',
        profile_accent: 'emerald'
      },
      {
        email: 'emily@oakridge.edu',
        password: 'password123',
        fullName: 'Emily Watson',
        role: 'student',
        status: 'approved',
        username: 'emilyw',
        bio: 'Writings and languages. Learning French and German.',
        favorite_subjects: ['English Literature', 'Foreign Languages'],
        skills: ['Creative Writing', 'Public Speaking'],
        interests: ['Journalism', 'Foreign Policy'],
        hobbies: ['Reading', 'Debate Club'],
        achievements: ['Best Delegate Model United Nations (2025)'],
        birthday: '2010-12-01',
        profile_accent: 'violet'
      },
      {
        email: 'david@oakridge.edu',
        password: 'password123',
        fullName: 'David Vance',
        role: 'student',
        status: 'approved',
        username: 'david_v',
        bio: 'Full-stack builder. Making apps in React Native and Next.js.',
        favorite_subjects: ['Computer Science', 'Business'],
        skills: ['Node.js', 'React Native', 'Supabase'],
        interests: ['App Development', 'SaaS startups'],
        hobbies: ['Swimming', 'Playing Drums'],
        achievements: ['Built oakridge-scheduler-app (used by 200 classmates)'],
        birthday: '2010-01-20',
        profile_accent: 'orange'
      },
      {
        email: 'sam@oakridge.edu',
        password: 'password123',
        fullName: 'Sam Peterson',
        role: 'student',
        status: 'pending', // Pending student 1
        username: 'sampeterson',
        bio: 'Just registered. Hope to join the web dev section.'
      },
      {
        email: 'lucy@oakridge.edu',
        password: 'password123',
        fullName: 'Lucy Chen',
        role: 'student',
        status: 'pending', // Pending student 2
        username: 'lucychen',
        bio: 'New student transfer. Excited to meet everyone!'
      }
    ];

    console.log('Seeding student auth & profiles...');
    const profileMap = {}; // Maps email to user ID

    for (const u of usersToCreate) {
      // Create Auth user
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email: u.email,
        password: u.password,
        email_confirm: true // bypass email verification in dev
      });

      if (authError) {
        if (authError.message.includes('already registered')) {
          // If already exists, delete and recreate
          console.log(`User ${u.email} already exists. Attempting lookup...`);
          const { data: existingUsers } = await supabase.auth.admin.listUsers();
          const found = existingUsers.users.find(x => x.email === u.email);
          if (found) {
            await supabase.auth.admin.deleteUser(found.id);
            // Re-create
            const { data: retryUser, error: retryError } = await supabase.auth.admin.createUser({
              email: u.email,
              password: u.password,
              email_confirm: true
            });
            if (retryError) throw retryError;
            profileMap[u.email] = retryUser.user.id;
          }
        } else {
          throw authError;
        }
      } else {
        profileMap[u.email] = authUser.user.id;
      }

      const uid = profileMap[u.email];

      // Create Database Profile record
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: uid,
          classroom_id: classroom.id,
          email: u.email,
          full_name: u.fullName,
          nickname: u.email === 'jane@oakridge.edu' ? 'Jenny' : null,
          username: u.username,
          bio: u.bio,
          role: u.role,
          status: u.status,
          favorite_subjects: u.favorite_subjects || [],
          interests: u.interests || [],
          hobbies: u.hobbies || [],
          skills: u.skills || [],
          achievements: u.achievements || [],
          birthday: u.birthday || null,
          profile_accent: u.profile_accent || 'indigo',
          show_birthday: !!u.birthday,
          show_external_links: true,
          show_achievements: true
        });

      if (profileError) throw profileError;
    }

    console.log('Seeded 9 fictional accounts (1 Admin, 6 Approved, 2 Pending).');

    // 6. Seed Projects
    console.log('Seeding projects...');
    const projectSeeds = [
      {
        email: 'jane@oakridge.edu',
        title: 'ClassSpace Yearbook Prototype',
        description: 'A Next.js prototype showcase card yearbook platform designed with Tailwind CSS, utilizing strict permissions and hashed codes.',
        technologies: ['Next.js', 'React', 'Tailwind CSS', 'Supabase'],
        github_url: 'https://github.com/janedoe/classspace',
        live_url: 'https://classspace.vercel.app'
      },
      {
        email: 'john@oakridge.edu',
        title: 'Arduino Soil Moisture Monitor',
        description: 'Built a custom sensor array connected to a node server to monitor soil hydration level in the school garden and email automated alerts.',
        technologies: ['Arduino', 'C++', 'Node.js', 'HTML'],
        github_url: 'https://github.com/johnsmith/soil-monitor'
      },
      {
        email: 'sarah@oakridge.edu',
        title: 'Figma UI Layout Pack',
        description: 'Designed 5 dynamic, glassmorphism dashboard variants and landing pages specifically structured for mobile apps.',
        technologies: ['Figma', 'Graphic Design', 'UI/UX'],
        live_url: 'https://figma.com/@sarahj_portfolio'
      },
      {
        email: 'david@oakridge.edu',
        title: 'Oakridge Scheduler App',
        description: 'Developed a schedule organizer mobile application that helps high schoolers log classes, track assignments, and compile study groups.',
        technologies: ['React Native', 'Expo', 'Supabase', 'Node.js'],
        github_url: 'https://github.com/davidv/oakridge-scheduler',
        live_url: 'https://play.google.com/store/apps/oakridge'
      }
    ];

    for (const p of projectSeeds) {
      const profileId = profileMap[p.email];
      const { error: projectError } = await supabase
        .from('projects')
        .insert({
          profile_id: profileId,
          title: p.title,
          description: p.description,
          technologies: p.technologies,
          github_url: p.github_url || null,
          live_url: p.live_url || null,
          project_date: '2026-06-15',
          is_visible: true
        });

      if (projectError) throw projectError;
    }
    console.log('Seeded projects successfully.');

    // 7. Seed Announcements
    console.log('Seeding announcements...');
    const adminId = profileMap['admin@oakridge.edu'];
    const announcementSeeds = [
      {
        title: 'Welcome to ClassSpace!',
        content: 'Hi class! Welcome to our private ClassSpace portal. Please use this invitation code to register and build your showcase portfolios. Ensure your project cards and bios are complete so we can print the end-of-year yearbook directory!',
        is_pinned: true
      },
      {
        title: 'Upcoming Computer Science Quiz',
        content: 'Reminder: Our final quiz covering Database Schemas, RLS Policies, and Server Actions will take place this Friday. Review the handouts in the portal and ensure you complete your project repository links.',
        is_pinned: false,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days from now
      }
    ];

    for (const a of announcementSeeds) {
      const { error: annError } = await supabase
        .from('announcements')
        .insert({
          classroom_id: classroom.id,
          author_id: adminId,
          title: a.title,
          content: a.content,
          is_pinned: a.is_pinned,
          expires_at: a.expires_at || null
        });

      if (annError) throw annError;
    }
    console.log('Seeded announcements successfully.');

    // 8. Seed Reports
    console.log('Seeding reports...');
    const reporterId = profileMap['john@oakridge.edu'];
    const reportedId = profileMap['jane@oakridge.edu'];

    const { error: reportError } = await supabase
      .from('reports')
      .insert({
        classroom_id: classroom.id,
        reporter_id: reporterId,
        reported_profile_id: reportedId,
        reason: 'Typo in biography link',
        details: 'Jane Doe has a typo in her biography website URL redirecting to a placeholder instead of her actual project portfolio.',
        status: 'open'
      });

    if (reportError) throw reportError;
    console.log('Seeded reports successfully.');

    console.log('Database seeding completed successfully!');
    console.log('\nFictional login credentials for local testing:');
    console.log('1. Admin: admin@oakridge.edu (password: password123)');
    console.log('2. Approved Student: jane@oakridge.edu (password: password123)');
    console.log('3. Approved Student: john@oakridge.edu (password: password123)');
    console.log('4. Pending Student: sam@oakridge.edu (password: password123)');
  } catch (err) {
    console.error('Seeding encountered an error:', err);
  }
}

seed();
