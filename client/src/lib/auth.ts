export interface AuthUser {
  id: number;
  email: string;
  name: string;
}

class AuthService {
  private user: AuthUser | null = null;

  async login(email: string, name: string): Promise<AuthUser> {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, name }),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Login failed: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      this.user = data.user;
      localStorage.setItem('user', JSON.stringify(data.user));
      return data.user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    if (this.user) return this.user;

    const stored = localStorage.getItem('user');
    if (stored) {
      try {
        const user = JSON.parse(stored);
        // Verify with server
        const response = await fetch('/api/user', {
          headers: {
            'x-user-id': user.id.toString(),
          },
          credentials: 'include',
        });

        if (response.ok) {
          this.user = user;
          return user;
        }
      } catch (error) {
        // Invalid stored user
        localStorage.removeItem('user');
      }
    }

    return null;
  }

  logout() {
    this.user = null;
    localStorage.removeItem('user');
  }

  getAuthHeaders(): Record<string, string> {
    if (!this.user) return {};
    return {
      'x-user-id': this.user.id.toString(),
    };
  }
}

export const authService = new AuthService();
