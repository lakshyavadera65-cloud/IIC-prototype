export interface UserProfile {
  name: string;
  role: string;
  email: string;
  facility: string;
  clearanceLevel: string;
  avatarInitials: string;
}

export interface StoredUser extends UserProfile {
  passwordHash: string;
  createdAt: string;
}

export const DEMO_PERSONAS: UserProfile[] = [
  {
    name: 'Snehansh Sharma',
    role: 'Plant Operations Director',
    email: 'snehansh@pulse.manufacturing',
    facility: 'Bengaluru Industrial Hub (FAC-BLR-01)',
    clearanceLevel: 'Level 4: Full Autonomous Override',
    avatarInitials: 'SS',
  },
  {
    name: 'Lakshya Vadera',
    role: 'Chief Dispatch & Scheduling Lead',
    email: 'lakshya@pulse.manufacturing',
    facility: 'Bengaluru Industrial Hub (FAC-BLR-01)',
    clearanceLevel: 'Level 3: Strategic Re-Routing',
    avatarInitials: 'LV',
  },
  {
    name: 'Dr. Evelyn Reed',
    role: 'AI & Automation Systems Architect',
    email: 'evelyn.reed@pulse.ai',
    facility: 'Global Operations Centre',
    clearanceLevel: 'Level 4: Pipeline Telemetry',
    avatarInitials: 'ER',
  },
];

const STORAGE_KEY_USER = 'pulse_operator';
const STORAGE_KEY_USERS_DB = 'pulse_registered_users';
const STORAGE_KEY_REMEMBER = 'pulse_remember_me';

class AuthService {
  private getRegisteredUsers(): StoredUser[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_USERS_DB);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to load registered users:', e);
    }

    // Seed default demo personas as valid registered users
    const seeded: StoredUser[] = DEMO_PERSONAS.map((p) => ({
      ...p,
      passwordHash: 'pulse-secure-2026',
      createdAt: new Date().toISOString(),
    }));

    try {
      localStorage.setItem(STORAGE_KEY_USERS_DB, JSON.stringify(seeded));
    } catch (e) {
      console.error(e);
    }
    return seeded;
  }

  public getCurrentUser(): UserProfile | null {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_USER);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  }

  public isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }

  public async login(
    email: string,
    passkey: string,
    rememberMe: boolean = false
  ): Promise<UserProfile> {
    // Artificial latency for realistic cryptographic authentication experience
    await new Promise((res) => setTimeout(res, 450));

    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = passkey.trim();

    const users = this.getRegisteredUsers();
    const matchedUser = users.find(
      (u) => u.email.toLowerCase() === cleanEmail
    );

    // If demo persona or registered user matches
    if (matchedUser) {
      if (matchedUser.passwordHash && matchedUser.passwordHash !== cleanPass) {
        throw new Error('Invalid security passkey. Please check your credentials.');
      }

      const profile: UserProfile = {
        name: matchedUser.name,
        role: matchedUser.role,
        email: matchedUser.email,
        facility: matchedUser.facility,
        clearanceLevel: matchedUser.clearanceLevel,
        avatarInitials: matchedUser.avatarInitials,
      };

      this.saveSession(profile, rememberMe);
      return profile;
    }

    // Allow flexible login for operator domains in demo mode
    if (cleanEmail.includes('@') && cleanPass.length >= 6) {
      const initials = cleanEmail
        .split('@')[0]
        .slice(0, 2)
        .toUpperCase();

      const adHocUser: UserProfile = {
        name: cleanEmail.split('@')[0].replace('.', ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
        role: 'Operations Engineer',
        email: cleanEmail,
        facility: 'Bengaluru Industrial Hub (FAC-BLR-01)',
        clearanceLevel: 'Level 3: Strategic Re-Routing',
        avatarInitials: initials || 'OP',
      };

      this.saveSession(adHocUser, rememberMe);
      return adHocUser;
    }

    throw new Error('Operator identity not recognized. Register a new terminal account or select a 1-click persona.');
  }

  public async register(data: {
    name: string;
    email: string;
    passkey: string;
    role: string;
    facility: string;
  }): Promise<UserProfile> {
    await new Promise((res) => setTimeout(res, 550));

    const cleanEmail = data.email.trim().toLowerCase();
    const cleanPass = data.passkey.trim();

    if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      throw new Error('Please enter a valid industrial terminal email.');
    }

    if (cleanPass.length < 8) {
      throw new Error('Security passkey must be at least 8 characters.');
    }

    const users = this.getRegisteredUsers();
    if (users.some((u) => u.email.toLowerCase() === cleanEmail)) {
      throw new Error('An operator terminal with this email address already exists.');
    }

    const nameParts = data.name.trim().split(' ');
    const avatarInitials =
      nameParts.length >= 2
        ? (nameParts[0][0] + nameParts[1][0]).toUpperCase()
        : data.name.slice(0, 2).toUpperCase() || 'OP';

    let clearanceLevel = 'Level 3: Strategic Re-Routing';
    if (data.role.includes('Director') || data.role.includes('Architect')) {
      clearanceLevel = 'Level 4: Full Autonomous Override';
    } else if (data.role.includes('Quality') || data.role.includes('Supervisor')) {
      clearanceLevel = 'Level 3: Quality Telemetry';
    }

    const newUser: StoredUser = {
      name: data.name.trim(),
      role: data.role,
      email: cleanEmail,
      facility: data.facility,
      clearanceLevel,
      avatarInitials,
      passwordHash: cleanPass,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    try {
      localStorage.setItem(STORAGE_KEY_USERS_DB, JSON.stringify(users));
    } catch (e) {
      console.error('Failed to save registered users database:', e);
    }

    const profile: UserProfile = {
      name: newUser.name,
      role: newUser.role,
      email: newUser.email,
      facility: newUser.facility,
      clearanceLevel: newUser.clearanceLevel,
      avatarInitials: newUser.avatarInitials,
    };

    return profile;
  }

  public logout(): void {
    try {
      localStorage.removeItem(STORAGE_KEY_USER);
    } catch (e) {
      console.error(e);
    }
  }

  private saveSession(user: UserProfile, rememberMe: boolean): void {
    try {
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
      localStorage.setItem(STORAGE_KEY_REMEMBER, rememberMe ? 'true' : 'false');
    } catch (e) {
      console.error(e);
    }
  }
}

export const authService = new AuthService();
