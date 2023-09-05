import React from 'react';
import { shallow } from 'enzyme';
import Navigation from './Navigation';

describe('Navigation component', () => {
  it('renders correct navigation links when user is logged in', () => {
    const currentUser = { name: 'John Doe' };
    const wrapper = shallow(<Navigation logout={() => {}} />, {
      context: { currentUser },
    });
    expect(wrapper.contains(<NavLink to='/periods'>Set up Classes</NavLink>)).toEqual(true);
    expect(wrapper.contains(<NavLink to='/classrooms'>Create Classroom</NavLink>)).toEqual(true);
    expect(wrapper.contains(<NavLink to='/profile'>Profile</NavLink>)).toEqual(true);
    expect(wrapper.contains(<Link to='/' onClick={() => {}}>Log Out</Link>)).toEqual(true);
  });

  it('renders correct navigation links when user is not logged in', () => {
    const wrapper = shallow(<Navigation logout={() => {}} />);
    expect(wrapper.contains(<NavLink to='/login'>Login</NavLink>)).toEqual(true);
    expect(wrapper.contains(<NavLink to='/signup'>Sign Up</NavLink>)).toEqual(true);
  });

  it('calls the logout function when Log Out button is clicked', () => {
    const mockLogout = jest.fn();
    const wrapper = shallow(<Navigation logout={mockLogout} />, {
      context: { currentUser: { name: 'John Doe' } },
    });
    wrapper.find('Link').simulate('click');
    expect(mockLogout).toHaveBeenCalled();
  });
});
