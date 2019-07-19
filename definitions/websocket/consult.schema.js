/**
 * Schema Message for validate the socket request 
 * @return {object}
 */
const message_schema = {
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

/**
 * Schema Join for validate the socket request 
 */
const join_schema = {
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

/**
 * Schema Read for validate the socket request 
 */
const read_schema = {
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

/**
 * Schema Delete for validate the socket request 
 */
const delete_schema = read_schema;

/**
 * Schema Typing for validate the socket request 
 */
const typing_schema = {
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

/**
 * Schema Load History for validate the socket request 
 */
const loadhistory_schema = {
    type: 'object',
    required: true,
    properties: {
        transaksi_konsul_id: {
            type: 'string',
            required: true
        }
    }
};

module.exports = {
    message_schema,
    join_schema,
    read_schema,
    delete_schema,
    typing_schema,
    loadhistory_schema
}