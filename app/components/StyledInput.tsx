import React from 'react';
import styled from 'styled-components';

const primary = '#11998e';
const secondary = '#38ef7d';
const white = '#fff';
const gray = '#9b9b9b';

const FormGroup = styled.div`
  position: relative;
  padding: 15px 0 0;
  margin-top: 10px;
  width: 50%;
  margin-bottom: 20px; 
`;

const FormField = styled.input`
  font-family: inherit;
  width: 100%;
  border: 0;
  border-bottom: 2px solid ${gray};
  outline: 0;
  font-size: 1.3rem;
  color: ${primary};
  padding: 7px 0;
  background: transparent;
  transition: border-color 0.2s;

  &::placeholder {
    color: transparent;
  }

  &:placeholder-shown ~ label {
    font-size: 1.3rem;
    cursor: text;
    top: 20px;
  }

  &:focus {
    ~ label {
      position: absolute;
      top: 0;
      display: block;
      transition: 0.2s;
      font-size: 1rem;
      color: ${primary};
      font-weight: 700;
    }
    padding-bottom: 6px;
    font-weight: 700;
    border-width: 3px;
    border-image: linear-gradient(to right, ${primary}, ${secondary});
    border-image-slice: 1;
  }

  &:required,
  &:invalid {
    box-shadow: none;
  }
`;

const FormLabel = styled.label`
  position: absolute;
  top: 0;
  display: block;
  transition: 0.2s;
  font-size: 1rem;
  color: ${gray};
`;

interface StyledInputProps {
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const StyledInput: React.FC<StyledInputProps> = ({ label, name, type = "text", value, onChange }) => (
  <FormGroup>
    <FormField type={type} className="form__field" placeholder={label} name={name} id={name} required value={value} onChange={onChange} />
    <FormLabel htmlFor={name} className="form__label">{label}</FormLabel>
  </FormGroup>
);

export default StyledInput;
