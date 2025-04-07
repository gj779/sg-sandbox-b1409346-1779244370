import React from 'react'
import { Col, Input, Row } from 'reactstrap'

export const Search = ({ size, placeholder, onChange }) => {
    return (
        <Row>
            <Col md={size}>
                <Input
                    placeholder={placeholder}
                    type="search"
                    onChange={onChange}
                ></Input>
            </Col>
        </Row>
    )
}