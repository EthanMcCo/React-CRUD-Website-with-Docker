import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import LeagueRegistration from '../LeagueRegistration';

// Mock child components to isolate testing
jest.mock('../PlayerInputs', () => ({ players, setPlayers }) => (
  <div data-testid="player-inputs">
    {players.map((player, index) => (
      <input
        key={index}
        value={player}
        onChange={(e) => {
          const newPlayers = [...players];
          newPlayers[index] = e.target.value;
          setPlayers(newPlayers);
        }}
        data-testid={`player-input-${index}`}
      />
    ))}
  </div>
));

jest.mock('../TeamListItem', () => ({ teamName, canContact, onContactClick, onViewRoster, playNight }) => (
  <div data-testid="team-item">
    <span>{teamName}</span>
    <span>{playNight}</span>
    {canContact && <button onClick={onContactClick}>Contact</button>}
    <button onClick={onViewRoster}>View Roster</button>
  </div>
));

// Wrapper component for React Router
const RouterWrapper = ({ children }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe('LeagueRegistration Component', () => {
  beforeEach(() => {
    // Mock successful API responses
    fetch.mockImplementation((url) => {
      if (url.includes('/api/teams/league-teams')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            tentative: [
              { team_id: 1, team_name: 'Test Team 1', play_night: 'Monday', accepting_new_players: 1 }
            ],
            registered: [
              { team_id: 2, team_name: 'Test Team 2', play_night: 'Tuesday', accepting_new_players: 0 }
            ]
          })
        });
      }
      
      if (url.includes('/api/teams/available-leagues')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            leagues: [
              {
                league_id: 1,
                name: 'Monday Night League',
                season_name: 'Spring 2024',
                play_night: 'Monday',
                play_time: '19:00:00',
                skill_cap: 50,
                spots_remaining: 5,
                max_teams: 12
              }
            ]
          })
        });
      }
      
      if (url.includes('/api/teams/register')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true })
        });
      }
      
      if (url.includes('/api/teams/authenticate')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            team: { team_id: 1, team_name: 'My Team' }
          })
        });
      }
      
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({})
      });
    });
  });

  test('renders league registration page', async () => {
    await act(async () => {
      render(
        <RouterWrapper>
          <LeagueRegistration />
        </RouterWrapper>
      );
    });

    expect(screen.getByText('League Registration')).toBeInTheDocument();
    expect(screen.getByText(/Join our competitive pool leagues/)).toBeInTheDocument();
  });

  test('loads and displays teams on mount', async () => {
    await act(async () => {
      render(
        <RouterWrapper>
          <LeagueRegistration />
        </RouterWrapper>
      );
    });

    await waitFor(() => {
      expect(screen.getByText('Test Team 1')).toBeInTheDocument();
      expect(screen.getByText('Test Team 2')).toBeInTheDocument();
    });

    expect(fetch).toHaveBeenCalledWith('/api/teams/league-teams');
    expect(fetch).toHaveBeenCalledWith('/api/teams/available-leagues');
  });

  test('validates password requirements', async () => {
    await act(async () => {
      render(
        <RouterWrapper>
          <LeagueRegistration />
        </RouterWrapper>
      );
    });

    // Wait for leagues to load
    await waitFor(() => {
      expect(screen.getByText(/Monday Night League/)).toBeInTheDocument();
    });

    // Fill out form with short password
    await act(async () => {
      fireEvent.change(screen.getByLabelText(/Team Name/), { target: { value: 'Test Team' } });
      fireEvent.change(screen.getByLabelText(/Captain.*Email/), { target: { value: 'test@test.com' } });
      fireEvent.change(screen.getByDisplayValue('Select a league'), { target: { value: '1' } });
      fireEvent.change(screen.getByLabelText(/^Password:/), { target: { value: 'short' } });
      fireEvent.change(screen.getByLabelText(/Confirm Password/), { target: { value: 'short' } });
    });

    await act(async () => {
      fireEvent.click(screen.getByText('Submit'));
    });

    await waitFor(() => {
      expect(screen.getByText(/Password must be at least 8 characters/)).toBeInTheDocument();
    });
  });

  test('validates password confirmation match', async () => {
    await act(async () => {
      render(
        <RouterWrapper>
          <LeagueRegistration />
        </RouterWrapper>
      );
    });

    // Wait for leagues to load
    await waitFor(() => {
      expect(screen.getByText(/Monday Night League/)).toBeInTheDocument();
    });

    // Fill out form with mismatched passwords
    await act(async () => {
      fireEvent.change(screen.getByLabelText(/Team Name/), { target: { value: 'Test Team' } });
      fireEvent.change(screen.getByLabelText(/Captain.*Email/), { target: { value: 'test@test.com' } });
      fireEvent.change(screen.getByDisplayValue('Select a league'), { target: { value: '1' } });
      fireEvent.change(screen.getByLabelText(/^Password:/), { target: { value: 'password123' } });
      fireEvent.change(screen.getByLabelText(/Confirm Password/), { target: { value: 'different123' } });
    });

    await act(async () => {
      fireEvent.click(screen.getByText('Submit'));
    });

    await waitFor(() => {
      expect(screen.getByText(/Passwords do not match/)).toBeInTheDocument();
    });
  });

  test('filters teams by selected night', async () => {
    await act(async () => {
      render(
        <RouterWrapper>
          <LeagueRegistration />
        </RouterWrapper>
      );
    });

    // Wait for teams to load
    await waitFor(() => {
      expect(screen.getByText('Test Team 1')).toBeInTheDocument();
      expect(screen.getByText('Test Team 2')).toBeInTheDocument();
    });

    // Filter by Monday
    await act(async () => {
      fireEvent.change(screen.getByLabelText(/Filter Teams by Night/), { target: { value: 'Monday' } });
    });

    // Only Monday team should be visible
    expect(screen.getByText('Test Team 1')).toBeInTheDocument();
    expect(screen.queryByText('Test Team 2')).not.toBeInTheDocument();
  });

  test('handles team login form submission', async () => {
    await act(async () => {
      render(
        <RouterWrapper>
          <LeagueRegistration />
        </RouterWrapper>
      );
    });

    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByText('Team Captain Login')).toBeInTheDocument();
    });

    // Fill out login form
    const emailInputs = screen.getAllByPlaceholderText('Captain Email');
    const loginEmailInput = emailInputs.find(input => 
      input.closest('form').querySelector('button[type="submit"]')?.textContent === 'Manage Team'
    );
    
    const passwordInput = screen.getByPlaceholderText('Password');

    await act(async () => {
      fireEvent.change(loginEmailInput, { target: { value: 'captain@test.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(screen.getByText('Manage Team'));
    });

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/teams/authenticate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'captain@test.com',
          password: 'password123'
        })
      });
    });
  });

  test('handles successful team registration', async () => {
    await act(async () => {
      render(
        <RouterWrapper>
          <LeagueRegistration />
        </RouterWrapper>
      );
    });

    // Wait for leagues to load
    await waitFor(() => {
      expect(screen.getByText(/Monday Night League/)).toBeInTheDocument();
    });

    // Fill out registration form
    await act(async () => {
      fireEvent.change(screen.getByLabelText(/Team Name/), { target: { value: 'New Team' } });
      fireEvent.change(screen.getByLabelText(/Captain.*Email/), { target: { value: 'captain@test.com' } });
      fireEvent.change(screen.getByDisplayValue('Select a league'), { target: { value: '1' } });
      fireEvent.change(screen.getByLabelText(/^Password:/), { target: { value: 'password123' } });
      fireEvent.change(screen.getByLabelText(/Confirm Password/), { target: { value: 'password123' } });
    });

    await act(async () => {
      fireEvent.click(screen.getByText('Submit'));
    });

    await waitFor(() => {
      expect(screen.getByText(/Team Registration Successful/)).toBeInTheDocument();
    });

    // Form should be reset
    expect(screen.getByLabelText(/Team Name/)).toHaveValue('');
    expect(screen.getByLabelText(/Captain.*Email/)).toHaveValue('');
  });
});