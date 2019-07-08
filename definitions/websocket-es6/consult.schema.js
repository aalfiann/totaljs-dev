/**
 * WS Consult Schema
 */
"use strict";

    class ConsultSchema {
        
        /**
         * Schema Message for validate the socket request 
         * @return {object}
         */
        message_schema() {
            return {
                type: 'object',
                required: true,
                properties: {
                    transaksi_konsul_id: {
                        type: 'string',
                        required: true
                    },
                    akun_id: {
                        type: 'string',
                        required: true
                    },
                    akun_type: {
                        type: 'number',
                        required: true
                    },
                    message_type_id: {
                        type: 'number',
                        required: true
                    },
                    isi_messages: {
                        type: 'string',
                        required: true
                    }
                }
            };
        }

        /**
         * Schema Join for validate the socket request 
         */
        join_schema() {
            return {
                type: 'object',
                required: true,
                properties: {
                    transaksi_konsul_id: {
                        type: 'string',
                        required: true
                    },
                    akun_id: {
                        type: 'string',
                        required: true
                    },
                    akun_type: {
                        type: 'number',
                        required: true
                    }
                }
            };
        }

        /**
         * Schema Read for validate the socket request 
         */
        read_schema() {
            return {
                type: 'object',
                required: true,
                properties: {
                    transaksi_konsul_id: {
                        type: 'string',
                        required: true
                    },
                    messages_id: {
                        type: 'string',
                        required: true
                    }
                }
            };
        }

        /**
         * Schema Typing for validate the socket request 
         */
        typing_schema() {
            return {
                type: 'object',
                required: true,
                properties: {
                    transaksi_konsul_id: {
                        type: 'string',
                        required: true
                    },
                    akun_id: {
                        type: 'string',
                        required: true
                    }
                }
            };
        }

        /**
         * Schema Load History for validate the socket request 
         */
        loadhistory_schema() {
            return {
                type: 'object',
                required: true,
                properties: {
                    transaksi_konsul_id: {
                        type: 'string',
                        required: true
                    }
                }
            };
        }
        
    }

    module.exports = ConsultSchema;