import React from 'react';
import { render } from '@testing-library/react';
import Classroom from './Classroom';

it('renders loading spinner initially and table after loading', () => {
  const wrapper = shallow(<Classroom />);
  expect(wrapper.find(LoadingSpinner)).toHaveLength(1);
  wrapper.setState({ isLoading: false });
  expect(wrapper.find('#matrix')).toHaveLength(1);
});

it('handles table click and updates matrix state', () => {
  const mockUpdateSeatingConfig = jest.fn();
  const wrapper = mount(<Classroom updateSeatingConfig={mockUpdateSeatingConfig} />);
  wrapper.setState({ isLoading: false });
  const cell = wrapper.find('td').first();
  cell.simulate('click');
  expect(wrapper.state().matrix[0][0]).toEqual('');
  expect(mockUpdateSeatingConfig).toHaveBeenCalledWith(wrapper.state().matrix);
});

it('handles seat style form change and updates seatStyle state', () => {
  const wrapper = shallow(<Classroom />);
  const radio = wrapper.find('#teacher-desk-seat').last();
  radio.simulate('change');
  expect(wrapper.state().seatStyle).toEqual('teacher-desk');
});

it('generates correct HTML for table matrix', () => {
  const wrapper = shallow(<Classroom />);
  const instance = wrapper.instance();
  const mockAddTeacherDesk = jest.fn();
  const mockAddStudentDesks = jest.fn(() => [<div key='0' />]);
  instance.addTeacherDesk = mockAddTeacherDesk;
  instance.addStudentDesks = mockAddStudentDesks;
  instance.makeHtmlMatrix();
  expect(wrapper.find('table')).toHaveLength(1);
  expect(wrapper.find('td')).toHaveLength(144);
  expect(mockAddTeacherDesk).toHaveBeenCalled();
  expect(mockAddStudentDesks).toHaveBeenCalled();
});



  