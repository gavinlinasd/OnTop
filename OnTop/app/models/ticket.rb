class Ticket < ActiveRecord::Base
  attr_accessible :body, :email, :name, :subject
end
