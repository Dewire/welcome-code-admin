import React, { Component } from 'react';
import InputWithLabel from '../InputWithLabel';
import {
  getUsers,
  createUser,
} from '../../Utils/fetcherUtil';
import {
  getGroupName,
  validateEmail,
} from '../../Utils/otherUtils';

class ManageUsersComponent extends Component {
  constructor(props) {
    super(props);

    const { municipality } = this.props;
    const groupName = getGroupName(municipality);

    this.state = {
      users: {
        Users: [],
      },
      adminGroup: groupName,
      newUser: false,
      username: '',
      emailValidated: true,
    };
  }

  componentDidMount() {
    this.getUserPoolData();
  }

  async getUserPoolData() {
    const { jwtToken } = this.props;
    const { adminGroup } = this.state;
    try {
      const users = await getUsers(adminGroup, jwtToken);
      this.setState({ users: users.data });
    } catch (e) {
      console.log('Error fetching users', e);
    }
  }

  setNewUser() {
    this.setState(({ newUser }) => ({
      newUser: !newUser,
      username: '',
      emailValidated: true,
    }));
  }

  setUsername(event) {
    const {
      target: { value },
    } = event;
    this.setState({ username: value });
  }

  async saveNewUser() {
    const { username, adminGroup } = this.state;
    const {
      municipality, jwtToken, isLoading, toast,
    } = this.props;

    if (validateEmail(username)) {
      this.setState({ emailValidated: true });
      const userData = {
        email: username,
        municipality,
        groupName: adminGroup,
      };
      console.log('Trying to add new user', userData);
      isLoading(true);
      try {
        await createUser(userData, jwtToken);
        this.getUserPoolData();
        this.setNewUser();
        toast(true);
      } catch (e) {
        toast(false);
        console.log('Error saving user', e);
      } finally {
        isLoading(false);
      }
    } else {
      this.setState({ emailValidated: false });
    }
  }

  render() {
    const {
      users: { Users },
      newUser,
      username,
      emailValidated,
      adminGroup,
    } = this.state;
    const { text } = this.props;

    return (
      <div className="manage-users-wrapper">
        <h2>{text.user}</h2>
        <h4>{text.userGroup}: {adminGroup}</h4>
        {Users.length > 0 &&
          <ul>
            {
              Users.map(user => (
                <li key={user.Username}>
                  <p>{user.Username}</p>
                </li>
              ))
            }
          </ul>
        }
        {newUser &&
          <div>
            <InputWithLabel
              type="text"
              label={`${text.username} (${text.email})`}
              value={username}
              onChange={e => this.setUsername(e)}
            />
            { !emailValidated &&
            <p className="error-text">{text.emailError}</p>
          }
          </div>
        }
        <input
          type="button"
          className="btn green"
          value={newUser ? text.saveUser : text.addUser}
          onClick={newUser ? () => this.saveNewUser() : () => this.setNewUser()}
        />
      </div>
    );
  }
}

export default ManageUsersComponent;
