class CanvassesController < ApplicationController
  before_action :set_canvass,       only: [:show]
  before_action :authorize_canvass, only: [:show]

  def index
    @canvasses = current_user.canvasses
  end

  def show
  end

  def create
    @canvass = Canvass.create(user: current_user)

    redirect_to canvass_path(@canvass)
  end

  private

  def set_canvass
    @canvass = Canvass.find(params[:id])
  end

  def authorize_canvass
    unless current_user.canvasses.where(id: @canvass.id).exists?
      return redirect_to canvasses_path
    end
  end
end